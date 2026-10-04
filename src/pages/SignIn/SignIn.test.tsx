import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { useAuthStore } from '~/state/auth';
import { createFakeApi, DEFAULT_PASSWORD, DEFAULT_USER } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

const signIn = async (route: string, email: string, password: string, api = createFakeApi()) => {
  const utils = renderApp({ route, session: null, api });
  await utils.user.type(await screen.findByLabelText('Email address'), email);
  if (password) await utils.user.type(screen.getByLabelText('Password'), password);
  await utils.user.click(screen.getByRole('button', { name: 'Sign in' }));
  return utils;
};

describe('sign in', () => {
  it('signs in and opens the dashboard', async () => {
    const { api } = await signIn('/sign-in', DEFAULT_USER.email, DEFAULT_PASSWORD);

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
    expect(useAuthStore.getState().session).toMatchObject({
      token: 'test-token',
      userId: DEFAULT_USER.id
    });
    // The login response already had the user, so it isn't fetched again
    expect(api.callsTo('CurrentUser')).toHaveLength(0);
  });

  it('returns to the page they were heading for after signing in', async () => {
    const { router } = await signIn('/notes', DEFAULT_USER.email, DEFAULT_PASSWORD);

    expect(await findPageHeading('Notes')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/notes');
  });

  it('clears a wrong password and offers to reset it', async () => {
    await signIn('/sign-in', DEFAULT_USER.email, 'wrong-password');

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("That password isn't right.");
    expect(within(alert).getByRole('link', { name: 'Reset your password' })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(useAuthStore.getState().session).toBeNull();
  });

  it('offers to create an account for an unknown email', async () => {
    await signIn('/sign-in', 'new@example.com', DEFAULT_PASSWORD);

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent("We couldn't find an account with that email.");
    expect(within(alert).getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register'
    );
  });

  it('shows the wait under the password when there have been too many attempts', async () => {
    const api = createFakeApi();
    api.failNext('Login', 'TOO_MANY_REQUESTS', {
      message: 'Too many attempts. Try again in 15 minutes.'
    });
    await signIn('/sign-in', DEFAULT_USER.email, DEFAULT_PASSWORD, api);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many attempts. Try again in 15 minutes.'
    );
  });

  it('checks the fields before calling the API', async () => {
    const { api } = await signIn('/sign-in', 'not-an-email', '');

    expect(await screen.findByText('Enter a valid email address')).toBeInTheDocument();
    expect(screen.getByText('Enter your password')).toBeInTheDocument();
    expect(api.callsTo('Login')).toHaveLength(0);
  });

  it('links to forgot password', async () => {
    const { user } = renderApp({ route: '/sign-in', session: null });

    await user.click(await screen.findByRole('link', { name: 'Forgot password?' }));

    expect(await findPageHeading('Reset your password')).toBeInTheDocument();
  });
});
