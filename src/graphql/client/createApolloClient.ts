import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { SetContextLink } from '@apollo/client/link/context';
import { ErrorLink } from '@apollo/client/link/error';
import { isSessionError } from '~/lib/errors';
import { getAuthToken, useAuthStore } from '~/state/auth';

export const createCache = () => new InMemoryCache();

const apiUrl = import.meta.env.PROD
  ? import.meta.env.VITE_PROD_API_URL
  : (import.meta.env.VITE_DEV_API_URL ?? '/graphql');

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
}

export const createApolloClient = ({
  terminatingLink = new HttpLink({ uri: apiUrl })
}: Options = {}) => {
  // The API rejected the token (expired or invalid): end the session so the route guards send
  // the person to sign in, and drop their cached data
  const sessionLink = new ErrorLink(({ error }) => {
    if (!isSessionError(error)) return;

    const { session, endSession } = useAuthStore.getState();
    if (!session) return;

    endSession('expired');
    void client.clearStore();
  });

  const client = new ApolloClient({
    link: ApolloLink.from([sessionLink, authLink, terminatingLink]),
    cache: createCache(),
    devtools: { enabled: import.meta.env.DEV }
  });

  return client;
};
