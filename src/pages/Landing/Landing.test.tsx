import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { findPageHeading } from '~/test/queries';
import { renderApp } from '~/test/renderApp';

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

  it('walks through Setup’s five steps, starting at the first', async () => {
    renderApp({ route: '/', session: null });

    const steps = await screen.findByRole('list', { name: 'Setup steps, scroll sideways' });
    expect(
      within(steps)
        .getAllByRole('heading')
        .map(heading => heading.textContent)
    ).toEqual(['Pay', 'Your accounts', 'Regular payments', 'Coming up', 'Review']);
    expect(screen.getByRole('button', { name: 'Previous steps' })).toBeDisabled();
  });
});
