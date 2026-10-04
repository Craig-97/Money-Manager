import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { useAuthStore } from '~/state/auth';
import { createFakeApi, DEFAULT_USER } from '~/test/fakeApi';
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

    expect(await findPageHeading('First-time setup')).toBeInTheDocument();
  });

  it('keeps people who finished setup out of setup', async () => {
    renderApp({ route: '/setup' });

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('sends unknown paths home', async () => {
    renderApp({ route: '/nowhere' });

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('loads the user and account together, not one after the other', async () => {
    const { api } = renderApp({ route: '/dashboard' });

    await findPageHeading('Dashboard');
    expect(
      api.calls
        .map(call => call.operationName)
        .slice(0, 2)
        .sort()
    ).toEqual(['Account', 'CurrentUser']);
    expect(api.callsTo('Account')).toEqual([{ userId: DEFAULT_USER.id }]);
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
});
