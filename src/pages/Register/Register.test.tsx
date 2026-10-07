import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { useAuthStore } from '~/state/auth';
import { DEFAULT_USER } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

const fillIn = async (
  user: ReturnType<typeof renderApp>['user'],
  { email = 'sam@example.com', password = 'payday2026' } = {}
) => {
  await user.type(await screen.findByLabelText('First name'), 'Sam');
  await user.type(screen.getByLabelText('Surname'), 'Jones');
  await user.type(screen.getByLabelText('Email address'), email);
  await user.type(screen.getByLabelText('Password'), password);
};

describe('register', () => {
  it('creates the account, then starts setup', async () => {
    const { user, api } = renderApp({ route: '/register', session: null });

    await fillIn(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await findPageHeading('Account created')).toBeInTheDocument();
    expect(screen.getByText(/Nice to meet you, Sam/)).toBeInTheDocument();
    expect(api.callsTo('RegisterAndLogin')).toEqual([
      {
        input: {
          firstName: 'Sam',
          surname: 'Jones',
          email: 'sam@example.com',
          password: 'payday2026'
        }
      }
    ]);
    // Held back until they choose to carry on, so this screen isn't replaced straight away
    expect(useAuthStore.getState().session).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Set up your account' }));

    expect(await findPageHeading('When do you get paid?')).toBeInTheDocument();
    expect(useAuthStore.getState().session).toMatchObject({ userId: 'user-new' });
    // Straight to setup: the dashboard never opened to find there's no account
    expect(api.callsTo('Account')).toHaveLength(0);
  });

  it('ticks off the password rules as you type', async () => {
    const { user } = renderApp({ route: '/register', session: null });
    expect(await screen.findByText('At least 8 characters')).toHaveTextContent('(not yet)');

    await user.type(screen.getByLabelText('Password'), 'abcdefgh');

    expect(screen.getByText('At least 8 characters')).toHaveTextContent('(done)');
    expect(screen.getByText('Contains a number')).toHaveTextContent('(not yet)');
  });

  it('offers to sign in when the email already has an account', async () => {
    const { user } = renderApp({ route: '/register', session: null });

    await fillIn(user, { email: DEFAULT_USER.email });
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('An account with this email already exists.');
    expect(within(alert).getByRole('link', { name: 'Sign in instead' })).toHaveAttribute(
      'href',
      '/sign-in'
    );
  });

  it('checks the fields before calling the API', async () => {
    const { user, api } = renderApp({ route: '/register', session: null });

    await user.type(await screen.findByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Enter your first name')).toBeInTheDocument();
    expect(screen.getByText('Enter your surname')).toBeInTheDocument();
    expect(screen.getByText('Enter your email address')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(api.callsTo('RegisterAndLogin')).toHaveLength(0);
  });
});
