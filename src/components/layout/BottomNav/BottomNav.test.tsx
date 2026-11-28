import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from '~/test/renderApp';
import { resetViewport, setViewportWidth } from '~/test/viewport';

beforeEach(() => setViewportWidth(390));
afterEach(() => resetViewport());

// The sidebar is in the page too, hidden by CSS on mobile; the bottom nav is the one with More
const bottomNav = async () =>
  (await screen.findAllByRole('navigation', { name: 'Main' })).find(element =>
    within(element).queryByRole('button', { name: 'More' })
  )!;

const renderPage = async (route: string, heading: string) => {
  const utils = renderApp({ route });
  await screen.findByRole('heading', { level: 1, name: heading });
  return { ...utils, nav: await bottomNav() };
};

describe('BottomNav', () => {
  it('has the everyday pages either side of the add button, then More', async () => {
    const { nav } = await renderPage('/dashboard', 'Dashboard');

    expect(
      within(nav)
        .getAllByRole('link')
        .map(link => link.getAttribute('aria-label'))
    ).toEqual(['Dashboard', 'Recurring', 'Forecast']);
    expect(within(nav).getByRole('button', { name: 'Add payment' })).toBeInTheDocument();
  });

  it('opens the other pages and the profile from More', async () => {
    const { user, nav } = await renderPage('/dashboard', 'Dashboard');

    await user.click(within(nav).getByRole('button', { name: 'More' }));
    const sheet = await screen.findByRole('dialog', { name: 'More' });
    const links = within(sheet).getAllByRole('link');
    // Each with a line saying what's there
    expect(links.map(link => link.textContent)).toEqual([
      'Accounts1 account',
      'DebtsLoans and cards you’re paying off',
      expect.stringMatching(/^Notes(\d+ notes?|Nothing written yet)$/),
      expect.stringMatching(/^Reminders(\d+ new|What’s due, renewing and coming up)$/),
      'ProfileTest Account'
    ]);

    await user.click(links[1]);

    expect(await screen.findByRole('heading', { level: 1, name: 'Debts' })).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: 'More' })).not.toBeInTheDocument();
  });

  it('marks More as current on the pages it opens', async () => {
    const { user, nav } = await renderPage('/notes', 'Notes');

    const more = within(nav).getByRole('button', { name: 'More' });
    expect(more).toHaveAttribute('data-current');
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current'
    );

    await user.click(more);
    const sheet = await screen.findByRole('dialog', { name: 'More' });
    expect(within(sheet).getByRole('link', { name: /^Notes/ })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(sheet).getByRole('link', { name: /^Debts/ })).not.toHaveAttribute('aria-current');

    // Escape closes it, as any sheet
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog', { name: 'More' })).not.toBeInTheDocument();
  });

  it("doesn't mark More on the everyday pages", async () => {
    const { nav } = await renderPage('/forecast', 'Forecast');

    expect(within(nav).getByRole('button', { name: 'More' })).not.toHaveAttribute('data-current');
  });

  it.each([
    { route: '/dashboard', label: 'Add payment', heading: 'Dashboard' },
    { route: '/forecast', label: 'Add payment', heading: 'Forecast' },
    { route: '/profile', label: 'Add payment', heading: 'Profile' },
    { route: '/recurring', label: 'Add recurring payment', heading: 'Recurring payments' },
    { route: '/debts', label: 'Add a debt', heading: 'Debts' },
    { route: '/notes', label: 'Add note', heading: 'Notes' }
  ])('on $route the add button is $label', async ({ route, label, heading }) => {
    const { nav } = await renderPage(route, heading);

    expect(within(nav).getByRole('button', { name: label })).toBeInTheDocument();
  });

  it('adds a debt from the debts page', async () => {
    const { user, nav } = await renderPage('/debts', 'Debts');

    await user.click(within(nav).getByRole('button', { name: 'Add a debt' }));

    expect(await screen.findByRole('dialog', { name: 'Add a debt' })).toBeInTheDocument();
  });
});
