import { from, mergeMap, throwError } from 'rxjs';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { isSessionError } from '~/lib/errors';
import { getAuthToken, useAuthStore } from '~/state/auth';
import { apiUrl } from './apiUrl';
import { refreshSession, RefreshFn } from './refreshSession';

export const createCache = () => new InMemoryCache();

// Sends the session token as a Bearer header
const authLink = new SetContextLink(prevContext => {
  const token = getAuthToken();
  return {
    ...prevContext,
    headers: {
      ...prevContext.headers,
      ...(token ? { authorization: `Bearer ${token}` } : {})
    }
  };
});

interface Options {
  // Where operations are sent; tests pass the fake API's link
  terminatingLink?: ApolloLink;
  // How an expired token is swapped for a new one; tests pass their own
  refresh?: RefreshFn;
}

const HOUR_MS = 60 * 60 * 1000;

export const createApolloClient = ({
  terminatingLink = new HttpLink({ uri: apiUrl }),
  refresh = refreshSession
}: Options = {}) => {
  const endSession = () => {
    useAuthStore.getState().endSession('expired');
    void client.clearStore();
  };

  /*
   * The API rejected the token, usually because its hour is up. Ask for a new one with the refresh
   * cookie and send the operation again; only when that fails is the session over, and the route
   * guards send the person to sign in.
   */
  const sessionLink = new ErrorLink(({ error, operation, forward }) => {
    if (!isSessionError(error)) return;
    if (!useAuthStore.getState().session) return;

    // Already retried once with a fresh token, so this isn't the token's fault
    if (operation.getContext().retriedAfterRefresh) {
      endSession();
      return;
    }

    return from(refresh()).pipe(
      mergeMap(result => {
        if (!result) {
          endSession();
          return throwError(() => error);
        }

        useAuthStore.getState().startSession({
          token: result.token,
          userId: result.user.id,
          expiresAt: Date.now() + result.tokenExpiration * HOUR_MS
        });
        operation.setContext({ retriedAfterRefresh: true });
        return forward(operation);
      })
    );
  });

  const client = new ApolloClient({
    link: ApolloLink.from([sessionLink, authLink, terminatingLink]),
    cache: createCache(),
    devtools: { enabled: import.meta.env.DEV }
  });

  return client;
};
