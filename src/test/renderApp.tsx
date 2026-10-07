import { createMemoryRouter, RouterProvider } from 'react-router';
import { afterEach, vi } from 'vitest';
import { ApolloProvider } from '@apollo/client/react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { routes } from '~/app/routes';
import { TooltipProvider } from '~/components/ui/Tooltip';
import { createApolloClient, RefreshFn } from '~/graphql/client';
import { CurrentUserDocument } from '~/graphql/generated';
import { Session, useAuthStore } from '~/state/auth';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { usePrefsStore } from '~/state/prefs';
import { useSidebarStore } from '~/state/sidebar';
import { createFakeApi, DEFAULT_USER, FakeApi } from './fakeApi';

// Zustand stores are module level state, so reset them between tests
afterEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState(), true);
  usePrefsStore.setState(usePrefsStore.getInitialState(), true);
  useSidebarStore.setState(useSidebarStore.getInitialState(), true);
  usePaymentDialogStore.setState(usePaymentDialogStore.getInitialState(), true);
  vi.unstubAllGlobals();
});

export const testSession = (overrides: Partial<Session> = {}): Session => ({
  token: 'test-token',
  userId: DEFAULT_USER.id,
  expiresAt: Date.now() + 60 * 60 * 1000,
  ...overrides
});

interface RenderAppOptions {
  route?: string;
  api?: FakeApi;
  // Pass null to render signed out
  session?: Session | null;
  // What the refresh cookie gives back when the API rejects the token; nothing by default
  refresh?: RefreshFn;
  // Pass false to have the app fetch the user, which a session normally starts with
  cacheUser?: boolean;
  // Starts as a page load does: signed out until the refresh cookie brings the session back
  reload?: boolean;
}

// Mounts the real app (routes, guards, hooks, stores) against an in-memory fake API
export const renderApp = ({
  route = '/',
  api = createFakeApi(),
  session = testSession(),
  refresh = async () => null,
  cacheUser = true,
  reload = false
}: RenderAppOptions = {}) => {
  useAuthStore.setState(reload ? { session: null, restored: false } : { session, restored: true });
  // The refresh is a plain fetch, so it goes to the fake API this way
  if (reload) vi.stubGlobal('fetch', api.fetch);

  const client = createApolloClient({ terminatingLink: api.link, refresh });
  // A session always starts with the user in the cache, as useStartSession leaves it
  if (session && cacheUser && !reload) {
    client.writeQuery({
      query: CurrentUserDocument,
      data: { tokenFindUser: { __typename: 'User', ...api.currentUser() } }
    });
  }
  const router = createMemoryRouter(routes, { initialEntries: [route] });
  const user = userEvent.setup();

  const utils = render(
    <ApolloProvider client={client}>
      <TooltipProvider delayDuration={0}>
        <RouterProvider router={router} />
      </TooltipProvider>
    </ApolloProvider>
  );

  return { ...utils, api, user, client, router };
};
