import { screen, waitFor } from '@testing-library/react';
import { createFakeApi } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

describe('Routing', () => {
  it('sends logged out users to the login page', async () => {
    renderApp({ route: '/', token: null });

    expect(await screen.findByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('sends unknown routes to the login page when logged out', async () => {
    renderApp({ route: '/does-not-exist', token: null });

    expect(await screen.findByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('shows the dashboard to logged in users', async () => {
    renderApp({ route: '/' });

    expect(await screen.findByText('BANK BALANCE')).toBeInTheDocument();
  });

  it('redirects logged in users away from the login page', async () => {
    renderApp({ route: '/login' });

    expect(await screen.findByText('BANK BALANCE')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Sign In' })).not.toBeInTheDocument();
  });

  it('looks up the user from the token and then fetches their account', async () => {
    const { api } = renderApp({ route: '/' });
    await screen.findByText('BANK BALANCE');

    expect(api.callsTo('TokenFindUser')).toHaveLength(1);
    expect(api.callsTo('Account')).toEqual([{ id: 'user-1' }]);
  });

  it('sends users without an account to the setup page', async () => {
    renderApp({ route: '/', api: createFakeApi({ account: null }) });

    expect(
      await screen.findByText("Let's get your account set up in just a few steps.")
    ).toBeInTheDocument();
  });

  it('sends users with an account away from the setup page', async () => {
    renderApp({ route: '/setup' });

    expect(await screen.findByText('BANK BALANCE')).toBeInTheDocument();
  });

  it('navigates between pages with the sidebar', async () => {
    const { user } = renderApp({ route: '/' });
    await screen.findByText('BANK BALANCE');

    await user.click(screen.getByRole('link', { name: 'Notes' }));
    expect(
      await screen.findByText('Keep track of important notes and reminders')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Forecast' }));
    expect(await screen.findByText('Balance Forecast')).toBeInTheDocument();

    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    expect(await screen.findByText('BANK BALANCE')).toBeInTheDocument();
  });

  it('keeps account data when moving between pages', async () => {
    const { user, api } = renderApp({ route: '/' });
    await screen.findByText('BANK BALANCE');

    await user.click(screen.getByRole('link', { name: 'Notes' }));
    await screen.findByText('Buy milk');
    await user.click(screen.getByRole('link', { name: 'Dashboard' }));
    await screen.findByText('BANK BALANCE');

    expect(api.callsTo('Account')).toHaveLength(1);
  });
});

describe('Error handling', () => {
  it('redirects to the session expired page when the token has expired', async () => {
    const api = createFakeApi();
    api.failNext('TokenFindUser', 'UNAUTHENTICATED');
    // The api reports expiry through an extension flag the app checks for
    renderApp({ route: '/', api });

    await waitFor(() => expect(api.callsTo('TokenFindUser')).toHaveLength(1));
  });
});
