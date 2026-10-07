import { describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { useAuthStore } from '~/state/auth';
import { createFakeApi, DEFAULT_ACCOUNT, DEFAULT_USER } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('routing', () => {
  it('sends signed-out people to sign in', async () => {
    renderApp({ route: '/dashboard', session: null });

    expect(await findPageHeading('Welcome back')).toBeInTheDocument();
  });

  it('shows the landing page at home when signed out', async () => {
    renderApp({ route: '/', session: null });

    expect(await findPageHeading("Know what's left before payday.")).toBeInTheDocument();
  });

  it('keeps signed-in people out of the signed-out pages', async () => {
    renderApp({ route: '/register' });

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('opens the dashboard from the home page when signed in', async () => {
    const { router } = renderApp({ route: '/' });

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('sends people without an account to setup', async () => {
    renderApp({ route: '/dashboard', api: createFakeApi({ account: null }) });

    expect(await findPageHeading('When do you get paid?')).toBeInTheDocument();
  });

  it('keeps people who finished setup out of setup', async () => {
    renderApp({ route: '/setup' });

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('sends unknown paths home', async () => {
    renderApp({ route: '/nowhere' });

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('knows whether setup is finished from the session, without waiting on the account', async () => {
    const { api } = renderApp({ route: '/dashboard' });

    await findPageHeading('Dashboard');
    expect(api.calls.map(call => call.operationName)).toEqual(['Account']);
  });

  it('brings the user back on a page load, keeping setup closed once it is finished', async () => {
    renderApp({ route: '/setup', reload: true });

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
    expect((await screen.findAllByText('Test Account')).length).toBeGreaterThan(0);
  });

  it('offers a retry when the user fails to load', async () => {
    const api = createFakeApi();
    api.failNext('CurrentUser', 'INTERNAL_SERVER_ERROR');
    const { user } = renderApp({ route: '/dashboard', api, cacheUser: false });

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load your account");
    await user.click(screen.getByRole('button', { name: 'Try again' }));

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('offers a retry when the account fails to load', async () => {
    const api = createFakeApi();
    api.failNext('Account', 'INTERNAL_SERVER_ERROR');
    const { user } = renderApp({ route: '/dashboard', api });

    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });
});

describe('sessions', () => {
  it('logs out from the sidebar', async () => {
    const { user } = renderApp({ route: '/dashboard' });

    await findPageHeading('Dashboard');
    await user.click(screen.getByRole('button', { name: 'Log out' }));

    expect(await findPageHeading('Welcome back')).toBeInTheDocument();
    expect(useAuthStore.getState()).toMatchObject({ session: null, endReason: 'signed-out' });
    expect(screen.queryByText(/session has expired/)).not.toBeInTheDocument();
  });

  it('ends the session and explains why when the API says the token expired', async () => {
    const api = createFakeApi();
    api.failNext('Account', 'UNAUTHENTICATED', { extensions: { expired: true } });
    renderApp({ route: '/dashboard', api });

    expect(await findPageHeading('Welcome back')).toBeInTheDocument();
    expect(screen.getByText(/session has expired/)).toBeInTheDocument();
    await waitFor(() => expect(useAuthStore.getState().endReason).toBe('expired'));
  });

  it('swaps an expired token for a new one and carries on without signing out', async () => {
    const api = createFakeApi();
    api.failNext('Account', 'UNAUTHENTICATED', { extensions: { expired: true } });
    const refresh = vi.fn(async () => ({
      __typename: 'AuthData' as const,
      token: 'fresh-token',
      tokenExpiration: 1,
      user: { ...DEFAULT_USER, account: DEFAULT_ACCOUNT.id, __typename: 'User' as const }
    }));
    renderApp({ route: '/dashboard', api, refresh });

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().session?.token).toBe('fresh-token');
    expect(screen.queryByText(/session has expired/)).not.toBeInTheDocument();
  });
});
