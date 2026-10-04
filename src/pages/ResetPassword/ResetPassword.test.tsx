import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { useAuthStore } from '~/state/auth';
import { createFakeApi, DEFAULT_USER, VALID_RESET_TOKEN } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

const resetRoute = (token = VALID_RESET_TOKEN) => `/reset-password?token=${token}`;

describe('reset password', () => {
  it('sets the new password and signs in', async () => {
    const { user, api } = renderApp({ route: resetRoute(), session: null });

    await findPageHeading('Choose a new password');
    await user.type(screen.getByLabelText('New password'), 'newpass123');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await findPageHeading('Password updated')).toBeInTheDocument();
    expect(api.db.password).toBe('newpass123');
    expect(useAuthStore.getState().session).toMatchObject({ userId: DEFAULT_USER.id });

    await user.click(screen.getByRole('link', { name: 'Continue to dashboard' }));

    expect(await findPageHeading('Dashboard')).toBeInTheDocument();
  });

  it('shows an expired link straight away', async () => {
    renderApp({ route: resetRoute('used-token'), session: null });

    expect(await findPageHeading('This link has expired')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Send a new link' })).toHaveAttribute(
      'href',
      '/forgot-password'
    );
  });

  it('treats a link without a token as expired', async () => {
    const { api } = renderApp({ route: '/reset-password', session: null });

    expect(await findPageHeading('This link has expired')).toBeInTheDocument();
    expect(api.callsTo('PasswordResetTokenValid')).toHaveLength(0);
  });

  it('shows the link as expired if it runs out while typing', async () => {
    const api = createFakeApi();
    api.failNext('ResetPassword', 'PASSWORD_RESET_TOKEN_INVALID');
    const { user } = renderApp({ route: resetRoute(), session: null, api });

    await findPageHeading('Choose a new password');
    await user.type(screen.getByLabelText('New password'), 'newpass123');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(await findPageHeading('This link has expired')).toBeInTheDocument();
    expect(useAuthStore.getState().session).toBeNull();
  });

  it('checks the password meets the rules before calling the API', async () => {
    const { user, api } = renderApp({ route: resetRoute(), session: null });

    await findPageHeading('Choose a new password');
    await user.type(screen.getByLabelText('New password'), 'nonumbers');
    await user.click(screen.getByRole('button', { name: 'Update password' }));

    expect(
      await screen.findByText('Use at least 8 characters including a number')
    ).toBeInTheDocument();
    expect(api.callsTo('ResetPassword')).toHaveLength(0);
  });
});
