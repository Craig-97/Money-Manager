import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { useAuthStore } from '~/state/auth';
import { createFakeApi, DEFAULT_PASSWORD, DEFAULT_USER } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('routing', () => {
  it('sends signed-out people to sign in', async () => {
    renderApp({ route: '/dashboard', session: null });

    expect(await findPageHeading('Welcome back')).toBeInTheDocument();
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
    ).toEqual(['AccountStatus', 'CurrentUser']);
    expect(api.callsTo('AccountStatus')).toEqual([{ userId: DEFAULT_USER.id }]);
  });

  it('offers a retry when the account fails to load', async () => {
    const api = createFakeApi();
    api.failNext('AccountStatus', 'INTERNAL_SERVER_ERROR');
    const { user } = renderApp({ route: '/dashboard', api });

    await user.click(await screen.findByRole('button', { name: 'Try again' }));

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });
});

describe('signing in and out', () => {
  it('signs in and opens the dashboard', async () => {
    const { user, api } = renderApp({ route: '/sign-in', session: null });

    await user.type(await screen.findByLabelText('Email address'), DEFAULT_USER.email);
    await user.type(screen.getByLabelText('Password'), DEFAULT_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
    expect(useAuthStore.getState().session).toMatchObject({
      token: 'test-token',
      userId: DEFAULT_USER.id
    });
    // The login response already had the user, so it isn't fetched again
    expect(api.callsTo('CurrentUser')).toHaveLength(0);
  });

  it('returns to the page they were heading for after signing in', async () => {
    const { user, router } = renderApp({ route: '/notes', session: null });

    await user.type(await screen.findByLabelText('Email address'), DEFAULT_USER.email);
    await user.type(screen.getByLabelText('Password'), DEFAULT_PASSWORD);
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await findPageHeading('Notes')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/notes');
  });

  it('shows the API error when the password is wrong', async () => {
    const { user } = renderApp({ route: '/sign-in', session: null });

    await user.type(await screen.findByLabelText('Email address'), DEFAULT_USER.email);
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password');
    expect(useAuthStore.getState().session).toBeNull();
  });

  it('checks the fields before calling the API', async () => {
    const { user, api } = renderApp({ route: '/sign-in', session: null });

    await user.type(await screen.findByLabelText('Email address'), 'not-an-email');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(api.callsTo('Login')).toHaveLength(0);
  });

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
    api.failNext('AccountStatus', 'UNAUTHENTICATED', { extensions: { expired: true } });
    renderApp({ route: '/dashboard', api });

    expect(await findPageHeading('Welcome back')).toBeInTheDocument();
    expect(screen.getByText(/session has expired/)).toBeInTheDocument();
    await waitFor(() => expect(useAuthStore.getState().endReason).toBe('expired'));
  });
});
