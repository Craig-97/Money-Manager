import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from '~/test/renderApp';

const findPageHeading = (name: string) => screen.findByRole('heading', { level: 1, name });

describe('landing', () => {
  it('opens register from the hero', async () => {
    const { user } = renderApp({ route: '/', session: null });

    await findPageHeading("Know what's left before payday.");
    // The header, hero and closing band each have one
    await user.click(screen.getAllByRole('link', { name: 'Create account' })[1]);

    expect(await findPageHeading('Create your account')).toBeInTheDocument();
  });

  it('updates the demo as payments are ticked off', async () => {
    const { user } = renderApp({ route: '/', session: null });

    expect(await screen.findByText('3 left')).toBeInTheDocument();
    await user.click(screen.getByRole('checkbox', { name: /Mortgage/ }));

    expect(screen.getByText('2 left')).toBeInTheDocument();
    expect(screen.getByText('Paid')).toBeInTheDocument();
  });
});
