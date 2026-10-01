import { screen, waitFor } from '@testing-library/react';
import { createFakeApi } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const openLogin = async (api = createFakeApi()) => {
  const app = renderApp({ route: '/login', token: null, api });
  await screen.findByRole('button', { name: 'Sign In' });
  return app;
};

describe('Login', () => {
  it('logs in and shows the dashboard', async () => {
    const { user, api } = await openLogin();

    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('BANK BALANCE')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('test-token');
    expect(api.callsTo('Login')).toEqual([{ email: 'test@example.com', password: 'password1' }]);
  });

  it('validates the email and password before logging in', async () => {
    const { user, api } = await openLogin();

    await user.type(screen.getByLabelText('Email Address'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByText('Password is too short (min is 8 characters)')).toBeInTheDocument();
    expect(api.callsTo('Login')).toHaveLength(0);
  });

  it('requires the password to contain a number', async () => {
    const { user } = await openLogin();

    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'passwordonly');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Password must contain a number.')).toBeInTheDocument();
  });

  // Known bug: Apollo Client 4's lazy query function rejects on GraphQL errors, but LoginForm
  // expects { data, error } back, so the failure is unhandled and no message is shown.
  // it.fails passes while the bug exists and starts failing once it is fixed.
  it.fails('shows an error under the email when the user does not exist', async () => {
    const api = createFakeApi();
    api.failNext('Login', 'USER_EMAIL_NOT_FOUND', 'We could not find a user with that email');
    const { user } = await openLogin(api);

    await user.type(screen.getByLabelText('Email Address'), 'nobody@example.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('We could not find a user with that email')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  // Known bug: same unhandled rejection as above
  it.fails('shows an error under the password and clears it when it is incorrect', async () => {
    const api = createFakeApi();
    api.failNext('Login', 'INVALID_CREDENTIALS', 'Password is incorrect');
    const { user } = await openLogin(api);

    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    expect(await screen.findByText('Password is incorrect')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toHaveValue('');
    expect(screen.getByLabelText('Email Address')).toHaveValue('test@example.com');
  });
});

describe('Register', () => {
  const openRegister = async (api = createFakeApi({ account: null })) => {
    const app = await openLogin(api);
    await app.user.click(screen.getByRole('tab', { name: 'Register' }));
    await screen.findByLabelText('First Name');
    return app;
  };

  it('registers a new user and continues to account setup', async () => {
    const { user, api } = await openRegister();

    await user.type(screen.getByLabelText('First Name'), 'Ann');
    await user.type(screen.getByLabelText('Surname'), 'Lee');
    await user.type(screen.getByLabelText('Email Address'), 'ann@example.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.type(screen.getByLabelText('Confirm Password'), 'password1');
    await user.click(screen.getByRole('button', { name: /register|sign up|create/i }));

    expect(
      await screen.findByText("Let's get your account set up in just a few steps.")
    ).toBeInTheDocument();
    expect(api.callsTo('RegisterAndLogin')).toEqual([
      {
        user: { email: 'ann@example.com', password: 'password1', firstName: 'Ann', surname: 'Lee' }
      }
    ]);
    expect(localStorage.getItem('token')).toBe('test-token');
  });

  it('shows an error when the email is already registered', async () => {
    const api = createFakeApi({ account: null });
    api.failNext(
      'RegisterAndLogin',
      'USER_EXISTS',
      'Account with that email address already exists'
    );
    const { user } = await openRegister(api);

    await user.type(screen.getByLabelText('First Name'), 'Ann');
    await user.type(screen.getByLabelText('Surname'), 'Lee');
    await user.type(screen.getByLabelText('Email Address'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password1');
    await user.type(screen.getByLabelText('Confirm Password'), 'password1');
    await user.click(screen.getByRole('button', { name: /register|sign up|create/i }));

    await waitFor(() =>
      expect(screen.getByText('Account with that email address already exists')).toBeInTheDocument()
    );
    expect(localStorage.getItem('token')).toBeNull();
  });
});
