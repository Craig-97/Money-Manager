import { MemoryRouter } from 'react-router-dom';
import { afterEach } from 'vitest';
import { ApolloClient } from '@apollo/client';
import { ApolloProvider } from '@apollo/client/react';
import { ThemeProvider } from '@mui/material/styles';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createFakeApi, FakeApi } from './fakeApi';
import { createCache } from '~/graphql';
import { AppRoutes } from '~/routes';
import { SnackbarProvider, UserProvider, useAccountStore, useSidebarStore } from '~/state';
import { theme } from '~/styles';

// Zustand stores are module level state, so reset them between tests
afterEach(() => {
  useAccountStore.setState(useAccountStore.getInitialState(), true);
  useSidebarStore.setState(useSidebarStore.getInitialState(), true);
});

interface RenderAppOptions {
  route?: string;
  api?: FakeApi;
  // Pass null to render as a logged out user
  token?: string | null;
}

// Mounts the real app (providers, routes, hooks, stores) against an in-memory fake API
export const renderApp = ({
  route = '/',
  api = createFakeApi(),
  token = 'test-token'
}: RenderAppOptions = {}) => {
  if (token === null) {
    localStorage.removeItem('token');
  } else {
    localStorage.setItem('token', token);
  }

  const client = new ApolloClient({ link: api.link, cache: createCache() });
  const user = userEvent.setup();

  const utils = render(
    <ApolloProvider client={client}>
      <ThemeProvider theme={theme}>
        <UserProvider>
          <SnackbarProvider>
            <MemoryRouter initialEntries={[route]}>
              <AppRoutes />
            </MemoryRouter>
          </SnackbarProvider>
        </UserProvider>
      </ThemeProvider>
    </ApolloProvider>
  );

  return { ...utils, api, user, client };
};
