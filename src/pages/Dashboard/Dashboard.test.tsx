import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import {
  apiDate,
  apiDateFromToday,
  createFakeApi,
  DEFAULT_ACCOUNT,
  FakeAccount
} from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { resetViewport, setViewportWidth } from '~/test/viewport';

// Everything due today, so it falls once before payday. Tests pin today themselves, as a payday a
// month or more before the next one would put a monthly payment in the cycle twice.
const account = (overrides: Partial<FakeAccount> = {}): FakeAccount => ({
  ...structuredClone(DEFAULT_ACCOUNT),
  cycleStartedOn: apiDateFromToday(0),
  bankBalance: 1000,
  monthlyIncome: 2500,
  recurringPayments: [
    {
      id: 'netflix',
      name: 'Netflix',
      amount: 20,
      category: 'SUBSCRIPTION',
      frequency: 'MONTHLY',
      type: 'EXPENSE',
      // Starting today, so today is one of its dates whatever day the tests run
      firstPaymentDate: apiDateFromToday(0),
      lastPaymentDate: null,
      nextDueDate: apiDateFromToday(0),
      handled: [],
      renewalDate: null,
      renewalReminderDays: 0
    }
  ],
  oneOffPayments: [
    {
      id: 'refund',
      name: 'Refund',
      amount: 50,
      dueDate: apiDateFromToday(0),
      type: 'INCOME',
      category: 'OTHER'
    }
  ],
  ...overrides
});

const renderDashboard = (data = account()) => {
  const api = createFakeApi({ account: data });
  return { ...renderApp({ route: '/dashboard', api }), api };
};

const freeToSpend = () => screen.getByRole('group', { name: 'How free to spend is worked out' });

// A tooltip saying this; one that's closing can still be fading out
const findTooltip = (text: string) =>
  waitFor(() =>
    expect(screen.getAllByRole('tooltip').map(tooltip => tooltip.textContent)).toContain(text)
  );

describe('dashboard', () => {
  // Thursday 8 October 2026, partway through a cycle that ends Friday 30 October
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-08T09:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  it('works out what is free to spend before payday', async () => {
    renderDashboard();

    // £1,000 balance, less Netflix £20, plus the £50 refund
    const sum = await screen.findByRole('group', { name: 'How free to spend is worked out' });
    expect(within(sum).getByText('£1,030.00')).toBeInTheDocument();
    expect(within(sum).getByText('2 due before payday')).toBeInTheDocument();
  });

  it('nudges about a payment due today and marks it paid', async () => {
    const { user, api } = renderDashboard();

    const banner = await screen.findByRole('region', { name: 'Due today' });
    expect(banner).toHaveTextContent('Netflix · £20.00 is due today');

    await user.click(within(banner).getByRole('button', { name: 'Mark as paid' }));

    expect(
      await screen.findByText('Netflix marked as paid · £20.00 off your balance')
    ).toBeInTheDocument();
    expect(api.callsTo('MarkPaymentsPaid')).toEqual([
      { input: { accountId: 'account-1', recurringPaymentIds: ['netflix'], oneOffPaymentIds: [] } }
    ]);
    // It comes off the balance and out of what's still due, so free to spend stays the same
    expect(within(freeToSpend()).getByText('£980.00')).toBeInTheDocument();
    expect(within(freeToSpend()).getByText('£1,030.00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Netflix' })).not.toBeInTheDocument();
  });

  it('settles a one-off payment, updating the balance and removing it', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'More actions for Refund' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Mark as paid' }));

    expect(
      await screen.findByText('Refund marked as paid · £50.00 added to your balance')
    ).toBeInTheDocument();
    expect(api.db.account?.oneOffPayments).toEqual([]);
    expect(within(freeToSpend()).getByText('£1,050.00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Refund' })).not.toBeInTheDocument();
  });

  it('adds a one-off payment', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'One-off payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add one-off payment' });
    await user.type(within(dialog).getByLabelText('Name'), 'Concert');
    await user.type(within(dialog).getByLabelText('Amount'), '45');
    await user.click(within(dialog).getByRole('button', { name: 'Add payment' }));

    expect(await screen.findByText('Added Concert')).toBeInTheDocument();
    expect(api.callsTo('CreateOneOffPayment')).toEqual([
      {
        input: expect.objectContaining({
          accountId: 'account-1',
          name: 'Concert',
          amount: 45,
          type: 'EXPENSE',
          category: 'OTHER'
        })
      }
    ]);
    await user.click(screen.getByRole('radio', { name: /One-off/ }));
    expect(screen.getByRole('button', { name: 'Edit Concert' })).toBeInTheDocument();
  });

  it('closes an edit without sending anything when nothing changed', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Edit Netflix' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Edit recurring payment' })
      ).not.toBeInTheDocument()
    );
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([]);
  });

  it('skips a recurring payment for this cycle without touching the balance', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Edit Netflix' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit recurring payment' });
    await user.click(within(dialog).getByRole('button', { name: 'Skip this cycle' }));

    expect(await screen.findByText('Netflix skipped this cycle')).toBeInTheDocument();
    expect(api.callsTo('SkipRecurringPayments')).toEqual([
      { input: { accountId: 'account-1', recurringPaymentIds: ['netflix'] } }
    ]);
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([]);
    expect(api.db.account?.recurringPayments[0].handled).toEqual([
      { outcome: 'SKIPPED', dates: [apiDateFromToday(0)] }
    ]);
    expect(api.db.account?.bankBalance).toBe(1000);
    expect(await within(dialog).findByText(/^Skipped · next due/)).toBeInTheDocument();
  });

  it('checks a payment has a name and amount', async () => {
    const { user } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Recurring payment' }));
    const dialog = await screen.findByRole('dialog', { name: 'Add recurring payment' });
    await user.click(within(dialog).getByLabelText('Name'));
    await user.click(within(dialog).getByLabelText('Amount'));
    await user.tab();

    expect(within(dialog).getByText('Enter a name')).toBeInTheDocument();
    expect(within(dialog).getByText('Enter an amount above £0')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Add recurring payment' })).toBeDisabled();
  });

  it('edits the bank balance in place', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Edit bank balance' }));
    const field = screen.getByRole('textbox', { name: '£' });
    await user.clear(field);
    await user.type(field, '1,500{Enter}');

    await waitFor(() =>
      expect(api.callsTo('UpdateAccount')).toEqual([
        { id: 'account-1', input: { bankBalance: 1500 } }
      ])
    );
    expect(await within(freeToSpend()).findByText('£1,530.00')).toBeInTheDocument();
  });

  it('deletes the payments ticked in the list', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('checkbox', { name: 'Select all payments' }));
    expect(screen.getByText('2 selected')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Deleted 2 payments')).toBeInTheDocument();
    expect(api.callsTo('BatchDeleteRecurringPayments')).toEqual([{ ids: ['netflix'] }]);
    expect(api.callsTo('BatchDeleteOneOffPayments')).toEqual([{ ids: ['refund'] }]);
    expect(await screen.findByText('Nothing due before payday')).toBeInTheDocument();
  });

  it('suggests adding payments to a new account', async () => {
    renderDashboard(account({ recurringPayments: [], oneOffPayments: [] }));

    expect(
      await screen.findByText('Add your payments to see what is free to spend')
    ).toBeInTheDocument();
    expect(screen.getByText('Nothing due before payday')).toBeInTheDocument();
  });
});

describe('a payment due more than once before payday', () => {
  // Wednesday 7 October 2026; payday is the last working day, Friday 30 October. Only Date is faked.
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-07T09:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  // A £50 cleaner every Wednesday: 7, 14, 21 and 28 October fall before payday
  const cleanerAccount = () =>
    account({
      bankBalance: 1000,
      cycleStartedOn: apiDate('2026-09-30'),
      recurringPayments: [
        {
          id: 'cleaner',
          name: 'Cleaner',
          amount: 50,
          category: 'OTHER',
          frequency: 'WEEKLY',
          type: 'EXPENSE',
          firstPaymentDate: apiDate('2026-10-07'),
          lastPaymentDate: null,
          nextDueDate: apiDate('2026-10-07'),
          handled: [],
          renewalDate: null,
          renewalReminderDays: 0
        }
      ],
      oneOffPayments: []
    });

  const chooseFromMenu = async (user: ReturnType<typeof renderApp>['user'], name: string) => {
    await user.click(await screen.findByRole('button', { name: 'More actions for Cleaner' }));
    await user.click(await screen.findByRole('menuitem', { name }));
  };

  it('counts every date before payday, then pays them one at a time', async () => {
    const { user, api } = renderDashboard(cleanerAccount());

    // One row, marked as due four times
    expect(await screen.findByText('×4')).toBeInTheDocument();
    expect(screen.getByText(/due 4 times before payday/)).toBeInTheDocument();
    await user.hover(screen.getByText('×4'));
    await findTooltip(
      'Due 4 times before payday' +
        ['7', '14', '21', '28'].map(day => `Wed ${day} Oct £50.00`).join('')
    );
    // It closes as the pointer leaves, like the cycle bar's days
    await user.unhover(screen.getByText('×4'));
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
    // All four come out of what's free to spend
    expect(within(freeToSpend()).getByText('£800.00')).toBeInTheDocument();
    // The monthly total uses its average; hovering the ≈ says so
    const monthly = screen.getByRole('region', { name: 'Monthly money' });
    expect(monthly).toHaveTextContent('About £216.67 /mo');
    await user.hover(within(monthly).getByText('≈'));
    await findTooltip('Includes monthly averagesCleaner £216.67/mo');
    // Money out, in red as on the cycle bar
    expect(screen.getAllByText('Cleaner £216.67/mo')[0]).toHaveClass('text-expense');

    await chooseFromMenu(user, 'Mark Wed 7 Oct as paid');

    expect(
      await screen.findByText('Cleaner marked as paid · £50.00 off your balance')
    ).toBeInTheDocument();
    // Still in the upcoming list, now due next week
    expect(await screen.findByText('×3')).toBeInTheDocument();
    expect(api.db.account?.recurringPayments[0].nextDueDate).toBe(apiDate('2026-10-14'));
    expect(within(freeToSpend()).getByText('£800.00')).toBeInTheDocument();
  });

  it('skips the rest of the cycle at once', async () => {
    const { user, api } = renderDashboard(cleanerAccount());

    await chooseFromMenu(user, 'Skip the rest of this cycle (4)');

    expect(
      await screen.findByText('Cleaner skipped for the rest of this cycle')
    ).toBeInTheDocument();
    expect(api.callsTo('SkipRecurringPayments')).toEqual([
      { input: { accountId: 'account-1', recurringPaymentIds: ['cleaner'], until: '2026-10-30' } }
    ]);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Edit Cleaner' })).not.toBeInTheDocument()
    );
    expect(api.db.account?.bankBalance).toBe(1000);
  });

  it('shows how far through the cycle it is on the recurring tab', async () => {
    const data = cleanerAccount();
    data.recurringPayments[0].nextDueDate = apiDate('2026-10-14');
    data.recurringPayments[0].handled = [{ outcome: 'PAID', dates: [apiDate('2026-10-07')] }];
    const { user } = renderDashboard(data);

    await user.click(await screen.findByRole('radio', { name: /Recurring/ }));

    expect(await screen.findByText('1 of 4 paid')).toBeInTheDocument();
    // The list's total is a monthly figure, at the cleaner's weekly average
    const footer = screen.getByText('1 payment · recurring').parentElement!;
    expect(footer).toHaveTextContent(/≈ .?£216\.67 \/mo/);
  });
});

describe('payday prompt', () => {
  // Wednesday 30 September 2026 is the last day of the month, the accounts' payday. Only Date is
  // faked, so timers and user events run as normal.
  const setToday = (iso: string) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${iso}T09:00:00`));
  };
  beforeEach(() => setToday('2026-09-30'));
  afterEach(() => vi.useRealTimers());

  // A monthly payment whose 30 August date was left unpaid in the cycle that's ending, with this
  // cycle not started yet. It falls again today, 30 September.
  const paydayAccount = () =>
    account({
      cycleStartedOn: null,
      recurringPayments: [
        {
          id: 'netflix',
          name: 'Netflix',
          amount: 20,
          category: 'SUBSCRIPTION',
          frequency: 'MONTHLY',
          type: 'EXPENSE',
          firstPaymentDate: apiDateFromToday(-31),
          lastPaymentDate: null,
          nextDueDate: apiDateFromToday(-31),
          handled: [],
          renewalDate: null,
          renewalReminderDays: 0
        }
      ],
      oneOffPayments: []
    });

  it('confirms the balance and starts the new cycle', async () => {
    const { user, api } = renderDashboard(paydayAccount());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    const balance = within(dialog).getByLabelText(/Confirm your bank balance/);
    // £1,000 plus £2,500 income, less Netflix's £20 left over from August and £20 due today
    expect(balance).toHaveValue('3,460.00');
    expect(within(dialog).getByText('Projected')).toBeInTheDocument();

    await user.clear(balance);
    await user.type(balance, '3,450');
    expect(within(dialog).getByText('Edited')).toBeInTheDocument();
    expect(within(dialog).getByRole('checkbox', { name: /Netflix/ })).toBeChecked();
    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));

    expect(await within(dialog).findByText('New cycle started')).toBeInTheDocument();
    expect(dialog).toHaveTextContent(
      'Bank balance set to £3,450.00. 1 recurring payment was moved on to the new cycle.'
    );
    expect(api.callsTo('StartPaydayCycle')).toEqual([
      {
        input: expect.objectContaining({
          accountId: 'account-1',
          bankBalance: 3450,
          recurringPaymentIds: ['netflix']
        })
      }
    ]);
  });

  it('can be skipped and shown again', async () => {
    const { user } = renderDashboard(paydayAccount());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    await user.click(within(dialog).getByRole('button', { name: 'Skip for now' }));

    expect(await screen.findByText('Payday prompt skipped')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show again' }));

    expect(await screen.findByRole('dialog', { name: 'It’s payday' })).toBeInTheDocument();
  });

  it('says when it is catching up on a payday that has been', async () => {
    setToday('2026-10-04');
    renderDashboard(paydayAccount());

    const dialog = await screen.findByRole('dialog', { name: 'Start your new pay cycle' });
    expect(dialog).toHaveTextContent('Payday was Wednesday 30 September · 4 days ago');
  });

  it('leaves payments already in the new cycle where they are', async () => {
    setToday('2026-10-04');
    const data = paydayAccount();
    data.recurringPayments[0].nextDueDate = apiDate('2026-09-29');
    // Due after the payday being caught up on
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'gym',
      name: 'Gym',
      nextDueDate: apiDateFromToday(0)
    });
    renderDashboard(data);

    const dialog = await screen.findByRole('dialog', { name: 'Start your new pay cycle' });
    expect(within(dialog).getByRole('checkbox', { name: /Netflix/ })).toBeChecked();
    expect(within(dialog).queryByRole('checkbox', { name: /Gym/ })).not.toBeInTheDocument();
  });

  it('says when everything from the last cycle was paid or skipped', async () => {
    const data = paydayAccount();
    // Paid for 30 August, so it has already moved on to today, in the new cycle
    data.recurringPayments[0].nextDueDate = apiDateFromToday(0);
    data.recurringPayments[0].handled = [{ outcome: 'PAID', dates: [apiDateFromToday(-31)] }];
    renderDashboard(data);

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    expect(dialog).toHaveTextContent(
      "Everything from the last cycle was paid or skipped, so there's nothing to move on."
    );
    expect(within(dialog).queryByRole('checkbox', { name: /Netflix/ })).not.toBeInTheDocument();
  });

  it("doesn't show once this cycle has started", async () => {
    renderDashboard();

    await screen.findByRole('heading', { name: 'Dashboard' });
    expect(screen.queryByRole('dialog', { name: 'It’s payday' })).not.toBeInTheDocument();
  });
});

describe('moving a payday', () => {
  // Friday 4 December 2026: pay is on the last working day, Thursday 31 December
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-12-04T09:00:00'));
  });
  afterEach(() => {
    vi.useRealTimers();
    resetViewport();
  });

  // The cycle started on the last payday, so there's no payday prompt in the way
  const movable = () => account({ cycleStartedOn: apiDate('2026-11-30') });

  const openPicker = async (user: ReturnType<typeof renderDashboard>['user']) => {
    await user.click(await screen.findByRole('button', { name: 'Change this payday' }));
    return screen.findByRole('dialog', { name: 'Change this payday' });
  };

  it('moves the next payday and shows it moved', async () => {
    const { user, api } = renderDashboard(movable());
    let picker = await openPicker(user);

    // Nothing changed yet: the button just closes, without a request
    await user.click(within(picker).getByRole('button', { name: 'Keep Thu 31 Dec' }));
    expect(screen.queryByRole('dialog', { name: 'Change this payday' })).not.toBeInTheDocument();
    expect(api.callsTo('SetPaydayOverride')).toEqual([]);
    picker = await openPicker(user);
    await user.click(within(picker).getByRole('button', { name: /17 December 2026/ }));
    // Paid 14 days sooner
    expect(within(picker).getByText(/27 → 13/)).toBeInTheDocument();
    await user.click(within(picker).getByRole('button', { name: 'Move to Thu 17 Dec' }));

    expect(await screen.findByText('Payday moved to Thu 17 Dec')).toBeInTheDocument();
    expect(api.callsTo('SetPaydayOverride')).toEqual([
      { id: 'payday-1', for: '2026-12-31', date: '2026-12-17' }
    ]);
    const tile = screen.getByRole('region', { name: 'Next payday' });
    expect(within(tile).getByText('Moved from Thu 31 Dec')).toBeInTheDocument();
    expect(within(tile).getByText('Usual Thu 31 Dec')).toBeInTheDocument();
  });

  it('puts the payday back', async () => {
    const data = movable();
    data.payday!.overrides = [{ for: '2026-12-31', date: '2026-12-17' }];
    const { user, api } = renderDashboard(data);
    const tile = await screen.findByRole('region', { name: 'Next payday' });
    expect(within(tile).getByText('Moved from Thu 31 Dec')).toBeInTheDocument();

    const picker = await openPicker(user);
    await user.click(within(picker).getByRole('button', { name: 'Reset to usual' }));

    expect(await screen.findByText('Payday back to Thu 31 Dec')).toBeInTheDocument();
    expect(api.callsTo('SetPaydayOverride')).toEqual([
      { id: 'payday-1', for: '2026-12-31', date: null }
    ]);
    expect(within(tile).queryByText('Moved from Thu 31 Dec')).not.toBeInTheDocument();
  });

  it('moves it from the mobile sheet', async () => {
    setViewportWidth(390);
    const { user, api } = renderDashboard(movable());
    await user.click(await screen.findByRole('button', { name: /Change this payday/ }));
    const sheet = await screen.findByRole('dialog', { name: 'Change this payday' });

    await user.click(within(sheet).getByRole('button', { name: /17 December 2026/ }));
    await user.click(within(sheet).getByRole('button', { name: 'Move to Thu 17 Dec' }));

    expect(api.callsTo('SetPaydayOverride')).toEqual([
      { id: 'payday-1', for: '2026-12-31', date: '2026-12-17' }
    ]);
  });
});

describe('alerts', () => {
  // Thursday 8 October 2026
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-08T09:00:00'));
  });
  afterEach(() => vi.useRealTimers());

  // Netflix is due today, and breakdown cover renewed on 28 September without a new date set
  const renewedAccount = () => {
    const data = account();
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'breakdown',
      name: 'Breakdown cover',
      amount: 7.5,
      category: 'VEHICLE',
      firstPaymentDate: apiDate('2025-09-28'),
      nextDueDate: apiDate('2026-10-28'),
      renewalDate: apiDate('2026-09-28'),
      renewalReminderDays: 30
    });
    return data;
  };

  it('shows one alert at a time, moving between them', async () => {
    const { user } = renderDashboard(renewedAccount());

    const alerts = await screen.findByRole('region', { name: 'Alerts' });
    expect(within(alerts).getByRole('region', { name: 'Due today' })).toBeInTheDocument();
    expect(within(alerts).getByText('1 of 2')).toBeInTheDocument();

    await user.click(within(alerts).getByRole('button', { name: 'Next alert' }));

    const renewal = within(alerts).getByRole('region', { name: 'Breakdown cover has renewed' });
    expect(renewal).toHaveTextContent('Mon 28 Sep · £7.50 a month · check the price and next date');
    await user.click(within(renewal).getByRole('button', { name: 'Update' }));
    expect(
      await screen.findByText('Renewed on Mon 28 Sep. Has the price or date changed for next year?')
    ).toBeInTheDocument();
  });

  it('puts a renewal away for three days with Later', async () => {
    const { user, unmount } = renderDashboard(renewedAccount());

    const alerts = await screen.findByRole('region', { name: 'Alerts' });
    await user.click(within(alerts).getByRole('button', { name: 'Next alert' }));
    await user.click(within(alerts).getByRole('button', { name: 'Later' }));

    // Only due today is left, so there's nothing to page through
    expect(within(alerts).getByRole('region', { name: 'Due today' })).toBeInTheDocument();
    expect(within(alerts).queryByText('1 of 2')).not.toBeInTheDocument();
    expect(localStorage.getItem('mm-renewal-snooze')).toContain('breakdown:2026-9-28');

    // Still away two days later; back on the third
    unmount();
    vi.setSystemTime(new Date('2026-10-10T09:00:00'));
    renderDashboard(renewedAccount());
    await screen.findByRole('region', { name: 'Alerts' });
    expect(screen.queryByText('Breakdown cover has renewed')).not.toBeInTheDocument();
    expect(screen.queryByText('1 of 2')).not.toBeInTheDocument();
  });

  it('flags a renewal coming up within its reminder, after one that has gone by', async () => {
    // Car insurance is paid yearly on 24 October, 16 days away, with a reminder a month before
    const data = renewedAccount();
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'car',
      name: 'Car insurance',
      amount: 612,
      category: 'INSURANCE',
      frequency: 'ANNUALLY',
      firstPaymentDate: apiDate('2023-10-24'),
      nextDueDate: apiDate('2026-10-24'),
      renewalDate: null,
      renewalReminderDays: 30
    });
    const { user } = renderDashboard(data);

    const alerts = await screen.findByRole('region', { name: 'Alerts' });
    expect(within(alerts).getByText('1 of 3')).toBeInTheDocument();
    await user.click(within(alerts).getByRole('button', { name: 'Next alert' }));
    expect(
      within(alerts).getByRole('region', { name: 'Breakdown cover has renewed' })
    ).toBeInTheDocument();
    await user.click(within(alerts).getByRole('button', { name: 'Next alert' }));

    const coming = within(alerts).getByRole('region', {
      name: 'Car insurance renews in 16 days'
    });
    expect(coming).toHaveTextContent(
      'Sat 24 Oct · £612.00 a year · check the price before it renews'
    );
  });

  it('leaves a renewal alone with its reminder off until it has gone by', async () => {
    const data = account();
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'car',
      name: 'Car insurance',
      amount: 612,
      frequency: 'ANNUALLY',
      firstPaymentDate: apiDate('2023-10-24'),
      nextDueDate: apiDate('2026-10-24'),
      renewalDate: null,
      renewalReminderDays: 0
    });
    renderDashboard(data);

    await screen.findByRole('region', { name: 'Alerts' });
    expect(screen.queryByText(/Car insurance renews/)).not.toBeInTheDocument();
  });

  it('asks again once the snooze runs out', async () => {
    const { user, unmount } = renderDashboard(renewedAccount());
    const alerts = await screen.findByRole('region', { name: 'Alerts' });
    await user.click(within(alerts).getByRole('button', { name: 'Next alert' }));
    await user.click(within(alerts).getByRole('button', { name: 'Later' }));

    unmount();
    vi.setSystemTime(new Date('2026-10-11T09:30:00'));
    renderDashboard(renewedAccount());

    expect(await screen.findByText('1 of 2')).toBeInTheDocument();
  });
});
