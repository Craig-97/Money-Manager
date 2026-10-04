import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { createFakeApi } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('forgot password', () => {
  it('sends a reset link and waits before allowing a resend', async () => {
    const { user, api } = renderApp({ route: '/forgot-password', session: null });

    await user.type(await screen.findByLabelText('Email address'), ' sam@example.com ');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await findPageHeading('Check your email')).toBeInTheDocument();
    expect(screen.getByText('sam@example.com')).toBeInTheDocument();
    expect(api.callsTo('RequestPasswordReset')).toEqual([{ email: 'sam@example.com' }]);
    expect(screen.getByRole('button', { name: /Resend in 0:30/ })).toBeDisabled();
  });

  it('goes back to the form, keeping the email, to use a different one', async () => {
    const { user } = renderApp({ route: '/forgot-password', session: null });

    await user.type(await screen.findByLabelText('Email address'), 'sam@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    await user.click(await screen.findByRole('button', { name: 'Use a different email' }));

    expect(await findPageHeading('Reset your password')).toBeInTheDocument();
    expect(screen.getByLabelText('Email address')).toHaveValue('sam@example.com');
  });

  it('shows the wait when too many links have been asked for', async () => {
    const api = createFakeApi();
    api.failNext('RequestPasswordReset', 'TOO_MANY_REQUESTS', {
      message: 'Too many attempts. Try again in 60 minutes.'
    });
    const { user } = renderApp({ route: '/forgot-password', session: null, api });

    await user.type(await screen.findByLabelText('Email address'), 'sam@example.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Too many attempts. Try again in 60 minutes.'
    );
  });
});
