import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import {
  apiDate,
  createFakeApi,
  DEFAULT_ACCOUNT,
  FakeAccount,
  FakeRecurringPayment
} from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { resetViewport, setViewportWidth } from '~/test/viewport';

// Friday 2 October 2026; payday is the last working day, Friday 30 October. Only Date is faked.
beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-02T09:00:00'));
});
afterEach(() => {
  vi.useRealTimers();
  resetViewport();
});

const recurring = (
  fields: Partial<FakeRecurringPayment> & Pick<FakeRecurringPayment, 'id' | 'name'>
): FakeRecurringPayment => ({
  amount: 20,
  category: 'SUBSCRIPTION',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-02'),
  lastPaymentDate: null,
  // Worked out by the app from the schedule
  nextDueDate: null,
  handled: [],
  renewalDate: null,
  renewalReminderDays: 0,
  ...fields
});

const account = (): FakeAccount => ({
  ...structuredClone(DEFAULT_ACCOUNT),
  cycleStartedOn: apiDate('2026-09-30'),
  oneOffPayments: [],
  recurringPayments: [
    recurring({ id: 'netflix', name: 'Netflix' }),
    recurring({
      id: 'home',
      name: 'Home insurance',
      amount: 21,
      category: 'INSURANCE',
      firstPaymentDate: apiDate('2025-02-20'),
      renewalDate: apiDate('2027-02-02'),
      renewalReminderDays: 30
    }),
    recurring({
      id: 'car',
      name: 'Car insurance',
      amount: 612,
      category: 'INSURANCE',
      frequency: 'ANNUALLY',
      firstPaymentDate: apiDate('2023-10-24'),
      renewalReminderDays: 30
    }),
    // Its renewal went by on Monday and hasn't been moved on
    recurring({
      id: 'breakdown',
      name: 'Breakdown cover',
      amount: 7.5,
      category: 'VEHICLE',
      firstPaymentDate: apiDate('2025-09-28'),
      renewalDate: apiDate('2026-09-28'),
      renewalReminderDays: 30
    }),
    // Every Wednesday: 7, 14, 21 and 28 October fall before payday
    recurring({
      id: 'cleaner',
      name: 'Cleaner',
      amount: 50,
      category: 'HOME_MAINTENANCE',
      frequency: 'WEEKLY',
      firstPaymentDate: apiDate('2026-01-07')
    })
  ]
});

const renderRecurring = (data = account()) => {
  const api = createFakeApi({ account: data });
  return { ...renderApp({ route: '/recurring', api }), api };
};

describe('recurring page', () => {
  it('sums up the recurring payments', async () => {
    renderRecurring();

    const summary = await screen.findByRole('region', { name: 'Summary' });
    // £20 + £21 + £7.50 a month, and £50 a week at its monthly average
    expect(summary).toHaveTextContent('About £265.17 /mo');
    expect(summary).toHaveTextContent('+ £612.00/yr annual · 5 recurring payments');
    // Netflix today, the cleaner four times, home insurance, car insurance and breakdown cover
    expect(summary).toHaveTextContent('£860.505 payments by Fri 30 Oct');
    expect(summary).toHaveTextContent('Next: Car insurance, Sat 24 Oct');
  });

  it('lists renewals, with one that has gone by first', async () => {
    renderRecurring();

    const tile = await screen.findByRole('region', { name: 'Renewals coming up' });
    expect(within(tile).getByText('Next 6 months')).toBeInTheDocument();
    const rows = within(tile)
      .getAllByRole('button', { name: /insurance|cover/ })
      .map(row => row.textContent);
    expect(rows).toEqual([
      expect.stringContaining('Breakdown coverRenewed Mon 28 Sep · £7.50 a monthNeeds renewing'),
      expect.stringContaining('Car insuranceSat 24 Oct · £612.00 a year22 days'),
      expect.stringContaining('Home insuranceTue 2 Feb 2027 · £21.00 a month18 weeks')
    ]);
  });

  it('shows the renewals in the table from the tile', async () => {
    const { user } = renderRecurring();

    await user.click(await screen.findByRole('button', { name: 'View in payments' }));

    expect(screen.getByRole('radio', { name: /Renewals/ })).toBeChecked();
    const table = screen.getByRole('table', { name: 'Recurring payments' });
    expect(within(table).queryByRole('button', { name: 'Edit Netflix' })).not.toBeInTheDocument();
    // In its column, and under the name for narrower screens
    expect(within(table).getAllByText('Renews in 22 days')).not.toHaveLength(0);
    expect(within(table).getByText('3 payments · renewing')).toBeInTheDocument();
  });

  it('shows where each payment stands before payday, leaving renewals to their own tab', async () => {
    const { user } = renderRecurring();

    await user.click(await screen.findByRole('radio', { name: /Before payday/ }));

    const table = screen.getByRole('table', { name: 'Recurring payments' });
    expect(within(table).getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
    expect(within(table).queryByRole('columnheader', { name: 'Renewal' })).not.toBeInTheDocument();
    expect(within(table).queryByText('Renews in 22 days')).not.toBeInTheDocument();
    expect(within(table).getAllByText('1 of 5 paid')).not.toHaveLength(0);
  });

  it('finds payments by name or category', async () => {
    const { user } = renderRecurring();

    await user.type(await screen.findByRole('searchbox', { name: 'Search payments' }), 'insur');

    const table = screen.getByRole('table', { name: 'Recurring payments' });
    expect(within(table).getByRole('button', { name: 'Edit Home insurance' })).toBeInTheDocument();
    expect(within(table).getByRole('button', { name: 'Edit Car insurance' })).toBeInTheDocument();
    expect(within(table).queryByRole('button', { name: 'Edit Netflix' })).not.toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: 'Search payments' }), 'x');
    expect(within(table).getByText('No payments match')).toBeInTheDocument();
  });

  it('sorts by amount from the sort menu', async () => {
    const { user } = renderRecurring();

    await user.click(await screen.findByRole('button', { name: 'Sort: Date ↑' }));
    await user.click(await screen.findByRole('menuitemradio', { name: 'Amount' }));

    const names = within(screen.getByRole('table', { name: 'Recurring payments' }))
      .getAllByRole('button', { name: /^Edit / })
      .map(button => button.textContent);
    expect(names).toEqual([
      'Car insurance',
      'Cleaner',
      'Home insurance',
      'Netflix',
      'Breakdown cover'
    ]);
    expect(screen.getByRole('button', { name: 'Sort: Amount ↓' })).toBeInTheDocument();
  });

  it('keeps the category legend the same height on its last, shorter page', async () => {
    // A fifth category makes two pages of four beside the renewals
    const data = account();
    data.recurringPayments.push(
      recurring({ id: 'gym', name: 'Gym', amount: 34, category: 'MEMBERSHIP' })
    );
    const { user } = renderRecurring(data);

    const tile = await screen.findByRole('region', { name: 'By category' });
    const rows = () => tile.querySelectorAll('ul > li');
    expect(within(tile).getByText('1–4 of 5')).toBeInTheDocument();
    expect(rows()).toHaveLength(4);

    await user.click(within(tile).getByRole('button', { name: 'Next categories' }));

    expect(within(tile).getByText('5–5 of 5')).toBeInTheDocument();
    // One category, and room kept for three more
    expect(within(tile).getAllByRole('listitem')).toHaveLength(1);
    expect(rows()).toHaveLength(4);
  });

  it('sets a renewal on a payment', async () => {
    const { user, api } = renderRecurring();

    await user.click(await screen.findByRole('button', { name: 'Edit Netflix' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(dialog).getByRole('radio', { name: 'Renews' }));

    // A year from today, reminding a month before
    expect(within(dialog).getByRole('button', { name: /Renews on/ })).toHaveTextContent(
      'Sat 2 Oct 2027'
    );
    expect(within(dialog).getByText('Thu 2 Sep 2027 · 1 month before')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('radio', { name: '2 weeks' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Netflix')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([
      {
        id: 'netflix',
        input: expect.objectContaining({
          lastPaymentDate: null,
          renewalDate: '2027-10-02',
          renewalReminderDays: 14
        })
      }
    ]);
  });

  it('asks about a renewal that has gone by, and moves it on a year', async () => {
    const { user, api } = renderRecurring();

    await user.click(await screen.findByRole('button', { name: 'Edit Breakdown cover' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    expect(
      within(dialog).getByText(
        'Renewed on Mon 28 Sep. Has the price or date changed for next year?'
      )
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Set next renewal' }));
    expect(
      within(dialog).getByText('Check the amount above is your new price.')
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Breakdown cover')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({
      renewalDate: '2027-09-28',
      renewalReminderDays: 30
    });
  });

  it('stops a payment that no longer renews after its last payment before the renewal', async () => {
    const { user, api } = renderRecurring();

    await user.click(await screen.findByRole('button', { name: 'Edit Breakdown cover' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(dialog).getByRole('button', { name: 'No longer renews' }));
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    expect(await screen.findByText('Saved Breakdown cover')).toBeInTheDocument();
    expect(api.callsTo('UpdateRecurringPayment')[0].input).toMatchObject({
      lastPaymentDate: '2026-09-28',
      renewalDate: null,
      renewalReminderDays: 0
    });
  });

  it('only offers keeping going or stopping for a yearly payment', async () => {
    const { user } = renderRecurring();

    await user.click(await screen.findByRole('button', { name: 'Edit Car insurance' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });

    expect(within(dialog).queryByRole('radio', { name: 'Renews' })).not.toBeInTheDocument();
    expect(
      within(dialog).getByText('Renews with each payment · next on Sat 24 Oct 2026')
    ).toBeInTheDocument();
    expect(within(dialog).getByRole('radio', { name: '1 month' })).toBeChecked();
  });
});

describe('recurring page on mobile', () => {
  beforeEach(() => setViewportWidth(390));

  it('adds a recurring payment straight from the nav', async () => {
    const { user } = renderRecurring();

    // The sidebar is in the page too, hidden by CSS on mobile
    const nav = (await screen.findAllByRole('navigation', { name: 'Main' })).find(element =>
      within(element).queryByRole('button', { name: 'Add recurring payment' })
    )!;
    expect(within(nav).getByRole('link', { name: 'Recurring' })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(within(nav).queryByRole('link', { name: 'Profile' })).not.toBeInTheDocument();
    await user.click(within(nav).getByRole('button', { name: 'Add recurring payment' }));

    expect(
      await screen.findByRole('dialog', { name: 'Add recurring payment' })
    ).toBeInTheDocument();
  });

  it('says how often each payment goes, then its renewal or, before payday, where it stands', async () => {
    const { user } = renderRecurring();

    const row = async (name: string) =>
      (await screen.findByRole('button', { name: `Edit ${name}` })).textContent;
    expect(await row('Home insurance')).toContain('Monthly · Renews 2 Feb 2027');
    expect(await row('Car insurance')).toContain('Annually · Renews in 22 days');
    expect(await row('Breakdown cover')).toContain('Monthly · Needs renewing');
    // No renewal: its category instead
    expect(await row('Netflix')).toContain('Monthly · Subscription');

    await user.click(screen.getByRole('radio', { name: /Before payday/ }));

    expect(await row('Netflix')).toContain('Monthly · Unpaid');
    // Its 30 September date was before it was added, so it counts as paid, as on the dashboard
    expect(await row('Cleaner')).toContain('Weekly · 1 of 5 paid');
  });

  it('steps the sort through date, amount and name', async () => {
    const { user } = renderRecurring();

    const sort = await screen.findByRole('button', { name: 'Sort by date, earliest first' });
    await user.click(sort);
    await user.click(sort);
    expect(sort).toHaveAccessibleName('Sort by amount, highest first');
    expect(sort).toHaveTextContent('Amount ↓');
  });
});
