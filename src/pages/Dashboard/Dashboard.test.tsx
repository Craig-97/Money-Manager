import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { holdExitAnimations } from '~/test/exitAnimation';
import {
  apiDate,
  apiDateFromToday,
  createFakeApi,
  DEFAULT_BUDGET,
  FakeBudget,
  fakeRecord
} from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';
import { resetViewport, setViewportWidth } from '~/test/viewport';

// Everything due today, so it falls once before payday. Tests pin today themselves, as a payday a
// month or more before the next one would put a monthly payment in the cycle twice.
const budget = (overrides: Partial<FakeBudget> = {}): FakeBudget => ({
  ...structuredClone(DEFAULT_BUDGET),
  cycleStartedOn: apiDateFromToday(0),
  bankBalance: 1000,
  monthlyIncome: 2500,
  recurringPayments: [
    {
      id: 'netflix',
      name: 'Netflix',
      amount: 20,
      category: 'SUBSCRIPTIONS',
      frequency: 'MONTHLY',
      type: 'EXPENSE',
      // Starting today, so today is one of its dates whatever day the tests run
      firstPaymentDate: apiDateFromToday(0),
      lastPaymentDate: null,
      nextDueDate: apiDateFromToday(0),
      thisCycle: [],
      renewalDate: null
    }
  ],
  oneOffPayments: [
    {
      id: 'refund',
      name: 'Refund',
      amount: 50,
      dueDate: apiDateFromToday(0),
      type: 'INCOME',
      category: 'GENERAL'
    }
  ],
  ...overrides
});

const renderDashboard = (data = budget()) => {
  const api = createFakeApi({ budget: data });
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
      { input: { budgetId: 'budget-1', recurringPaymentIds: ['netflix'], oneOffPaymentIds: [] } }
    ]);
    // It comes off the balance and out of what's still due, so free to spend stays the same
    expect(within(freeToSpend()).getByText('£980.00')).toBeInTheDocument();
    expect(within(freeToSpend()).getByText('£1,030.00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit Netflix' })).not.toBeInTheDocument();
  });

  it('settles a one-off payment, keeping it marked paid on the one-off tab until payday', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'More actions for Refund' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Mark as paid' }));

    expect(
      await screen.findByText('Refund marked as paid · £50.00 added to your balance')
    ).toBeInTheDocument();
    expect(api.db.budget?.oneOffPayments[0]).toMatchObject({
      name: 'Refund',
      paidAt: expect.any(String)
    });
    expect(within(freeToSpend()).getByText('£1,050.00')).toBeInTheDocument();
    // Nothing left to pay, so it's gone from upcoming
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Edit Refund' })).not.toBeInTheDocument()
    );

    await user.click(screen.getByRole('radio', { name: /One-off/ }));
    expect(await screen.findByText('Paid')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'More actions for Refund' }));
    expect(screen.queryByRole('menuitem', { name: 'Mark as paid' })).not.toBeInTheDocument();
    await user.click(await screen.findByRole('menuitem', { name: 'Mark as unpaid' }));

    expect(
      await screen.findByText('Refund marked as unpaid · £50.00 off your balance')
    ).toBeInTheDocument();
    expect(api.callsTo('MarkPaymentsUnpaid')).toEqual([
      { input: { budgetId: 'budget-1', recurringPaymentIds: [], oneOffPaymentIds: ['refund'] } }
    ]);
    expect(api.db.budget?.oneOffPayments[0].paidAt).toBeNull();
    expect(within(freeToSpend()).getByText('£1,000.00')).toBeInTheDocument();
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
          budgetId: 'budget-1',
          name: 'Concert',
          amount: 45,
          type: 'EXPENSE',
          category: 'GENERAL'
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
      { input: { budgetId: 'budget-1', recurringPaymentIds: ['netflix'] } }
    ]);
    expect(api.callsTo('UpdateRecurringPayment')).toEqual([]);
    expect(api.db.budget?.recurringPayments[0].thisCycle).toEqual([
      expect.objectContaining({ kind: 'SKIPPED', dates: [apiDateFromToday(0)] })
    ]);
    expect(api.db.budget?.bankBalance).toBe(1000);
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
    expect(within(dialog).getByRole('button', { name: 'Add payment' })).toBeDisabled();
  });

  it('edits the bank balance in place', async () => {
    const { user, api } = renderDashboard();

    await user.click(await screen.findByRole('button', { name: 'Edit bank balance' }));
    const field = screen.getByRole('textbox', { name: '£' });
    await user.clear(field);
    await user.type(field, '1,500{Enter}');

    // Only the current account counts, so the bank balance is its balance
    await waitFor(() =>
      expect(api.callsTo('UpdateAccount')).toEqual([
        { id: 'account-current', input: { balance: 1500 } }
      ])
    );
    expect(await within(freeToSpend()).findByText('£1,530.00')).toBeInTheDocument();
  });

  it('checks each account’s balance once more than one counts', async () => {
    const { user, api } = renderDashboard(
      budget({
        accounts: [
          {
            id: 'easy',
            name: 'Easy access',
            kind: 'SAVINGS',
            balance: 4200,
            counts: true,
            interestRate: 4.1,
            purpose: null,
            balanceUpdatedAt: String(Date.now())
          }
        ]
      })
    );

    const figures = await screen.findByRole('group', { name: 'How free to spend is worked out' });
    expect(within(figures).getByText('2 accounts')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit bank balance' }));
    const dialog = await screen.findByRole('dialog', { name: 'Bank balance' });
    expect(within(dialog).getByText('£5,200.00')).toBeInTheDocument();

    const easy = within(dialog).getByLabelText('Easy access');
    await user.clear(easy);
    await user.type(easy, '4,300');
    expect(within(dialog).getByText('£5,300.00')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Save' }));

    await waitFor(() =>
      expect(api.callsTo('UpdateAccountBalances')).toEqual([
        { input: { budgetId: 'budget-1', balances: [{ accountId: 'easy', balance: 4300 }] } }
      ])
    );
    expect(await within(freeToSpend()).findByText('£5,300.00')).toBeInTheDocument();
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

  it('suggests adding payments to a new budget', async () => {
    renderDashboard(budget({ recurringPayments: [], oneOffPayments: [] }));

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
  const cleanerBudget = () =>
    budget({
      bankBalance: 1000,
      cycleStartedOn: apiDate('2026-09-30'),
      recurringPayments: [
        {
          id: 'cleaner',
          name: 'Cleaner',
          amount: 50,
          category: 'GENERAL',
          frequency: 'WEEKLY',
          type: 'EXPENSE',
          firstPaymentDate: apiDate('2026-10-07'),
          lastPaymentDate: null,
          nextDueDate: apiDate('2026-10-07'),
          thisCycle: [],
          renewalDate: null
        }
      ],
      oneOffPayments: []
    });

  const chooseFromMenu = async (user: ReturnType<typeof renderApp>['user'], name: string) => {
    await user.click(await screen.findByRole('button', { name: 'More actions for Cleaner' }));
    await user.click(await screen.findByRole('menuitem', { name }));
  };

  it('counts every date before payday, then pays them one at a time', async () => {
    const { user, api } = renderDashboard(cleanerBudget());

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
    expect(api.db.budget?.recurringPayments[0].nextDueDate).toBe(apiDate('2026-10-14'));
    expect(within(freeToSpend()).getByText('£800.00')).toBeInTheDocument();
  });

  it('skips the rest of the cycle at once', async () => {
    const { user, api } = renderDashboard(cleanerBudget());

    await chooseFromMenu(user, 'Skip the rest of this cycle (4)');

    expect(
      await screen.findByText('Cleaner skipped for the rest of this cycle')
    ).toBeInTheDocument();
    expect(api.callsTo('SkipRecurringPayments')).toEqual([
      { input: { budgetId: 'budget-1', recurringPaymentIds: ['cleaner'], until: '2026-10-30' } }
    ]);
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Edit Cleaner' })).not.toBeInTheDocument()
    );
    expect(api.db.budget?.bankBalance).toBe(1000);
  });

  it('shows how far through the cycle it is on the recurring tab', async () => {
    const data = cleanerBudget();
    data.recurringPayments[0].nextDueDate = apiDate('2026-10-14');
    data.recurringPayments[0].thisCycle = [
      fakeRecord('PAID', { dates: [apiDate('2026-10-07')], balanceChange: -50 })
    ];
    const { user } = renderDashboard(data);

    await user.click(await screen.findByRole('radio', { name: /Recurring/ }));

    expect(await screen.findByText('1 of 4 paid')).toBeInTheDocument();
    // The list's total is a monthly figure, at the cleaner's weekly average
    const footer = screen.getByText('1 payment · recurring').parentElement!;
    expect(footer).toHaveTextContent(/≈ .?£216\.67 \/mo/);
  });
});

describe('payday prompt', () => {
  // Wednesday 30 September 2026 is the last day of the month, the budgets' payday. Only Date is
  // faked, so timers and user events run as normal.
  const setToday = (iso: string) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${iso}T09:00:00`));
  };
  beforeEach(() => setToday('2026-09-30'));
  afterEach(() => vi.useRealTimers());

  // A monthly payment whose 30 August date was left unpaid in the cycle that's ending, with this
  // cycle not started yet. It falls again today, 30 September.
  const paydayBudget = () =>
    budget({
      cycleStartedOn: null,
      recurringPayments: [
        {
          id: 'netflix',
          name: 'Netflix',
          amount: 20,
          category: 'SUBSCRIPTIONS',
          frequency: 'MONTHLY',
          type: 'EXPENSE',
          firstPaymentDate: apiDateFromToday(-31),
          lastPaymentDate: null,
          nextDueDate: apiDateFromToday(-31),
          thisCycle: [],
          renewalDate: null
        }
      ],
      oneOffPayments: []
    });

  const outcomeOf = (dialog: HTMLElement, name: string) =>
    within(within(dialog).getByRole('radiogroup', { name: `What happened to ${name}` }));

  it('keeps the summary on screen while it closes, not the payday steps', async () => {
    holdExitAnimations();
    const { user } = renderDashboard(paydayBudget());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));
    await user.click(await within(dialog).findByRole('button', { name: 'Back to dashboard' }));

    // Still on screen while it animates away, showing the summary it closed from
    const closing = await screen.findByRole('dialog', { hidden: true });
    expect(closing).toHaveAttribute('data-state', 'closed');
    expect(closing).toHaveAccessibleName('New cycle started');
    expect(within(closing).queryByText('From last cycle')).not.toBeInTheDocument();
  });

  it('takes last cycle’s left-over payments as paid, and starts the new cycle', async () => {
    const { user, api } = renderDashboard(paydayBudget());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    expect(within(dialog).getByText('From last cycle')).toBeInTheDocument();
    expect(outcomeOf(dialog, 'Netflix').getByRole('radio', { name: 'Paid' })).toBeChecked();
    const balance = within(dialog).getByLabelText(/Confirm your current account/);
    // £1,000 plus £2,500 income, less Netflix's £20 from August, which went out
    expect(balance).toHaveValue('3,480.00');
    expect(within(dialog).getByText('Projected')).toBeInTheDocument();

    await user.clear(balance);
    await user.type(balance, '3,450');
    expect(within(dialog).getByText('Edited')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));

    expect(await within(dialog).findByText('New cycle started')).toBeInTheDocument();
    expect(dialog).toHaveTextContent(
      'Current account set to £3,450.00. Netflix was recorded as paid.'
    );
    expect(api.callsTo('StartPaydayCycle')).toEqual([
      {
        input: expect.objectContaining({
          budgetId: 'budget-1',
          paidIntoBalance: 3450,
          accountBalances: [],
          leftOver: [{ recurringPaymentId: 'netflix', outcome: 'PAID' }],
          alreadyPaid: { recurringPaymentIds: [], oneOffPaymentIds: [] }
        })
      }
    ]);
  });

  it('confirms where pay lands, and takes what went out of other accounts off theirs', async () => {
    const data = paydayBudget();
    data.recurringPayments[0].account = 'joint';
    data.accounts = [
      {
        id: 'joint',
        name: 'Joint bills',
        kind: 'SPENDING',
        balance: 2105,
        counts: true,
        interestRate: null,
        purpose: null,
        balanceUpdatedAt: apiDateFromToday(0)
      }
    ];
    const { user, api } = renderDashboard(data);

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    // Netflix comes out of Joint bills, so only the income goes on here
    expect(within(dialog).getByLabelText(/Confirm your current account/)).toHaveValue('3,500.00');
    // With two accounts to spend from, each payment says which it goes out of
    expect(dialog).toHaveTextContent('From Joint bills · was due');
    // The last step starts folded away, even with another account to spend from
    const others = within(dialog).getByRole('button', { name: /Update your other accounts/ });
    expect(others).toHaveAttribute('aria-expanded', 'false');
    await user.click(others);
    expect(dialog).toHaveTextContent('SpendingCounts in free to spend');
    const joint = within(dialog).getByLabelText('Joint bills');
    expect(joint).toHaveValue('2,085.00');
    expect(dialog).toHaveTextContent('After £20.00 of bills · updated today');
    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));

    expect(await within(dialog).findByText('New cycle started')).toBeInTheDocument();
    expect(api.callsTo('StartPaydayCycle')).toEqual([
      {
        input: expect.objectContaining({
          paidIntoBalance: 3500,
          // Not what the API would leave it at, so it's sent
          accountBalances: [{ accountId: 'joint', balance: 2085 }]
        })
      }
    ]);
  });

  it('adds back a left-over payment that didn’t go out, and says when it’s next due', async () => {
    const { user, api } = renderDashboard(paydayBudget());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    await user.click(outcomeOf(dialog, 'Netflix').getByRole('radio', { name: 'Didn’t go out' }));

    expect(within(dialog).getByText('Next due today')).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Confirm your current account/)).toHaveValue('3,500.00');
    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));

    expect(await within(dialog).findByText(/Netflix was recorded as skipped/)).toBeInTheDocument();
    expect(api.callsTo('StartPaydayCycle')).toEqual([
      {
        input: expect.objectContaining({
          leftOver: [{ recurringPaymentId: 'netflix', outcome: 'SKIPPED' }]
        })
      }
    ]);
  });

  it('keeps a left-over payment still to pay overdue, and leaves today’s date for later', async () => {
    const { user } = renderDashboard(paydayBudget());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    expect(within(dialog).getByRole('checkbox', { name: /Netflix/ })).toBeInTheDocument();
    await user.click(outcomeOf(dialog, 'Netflix').getByRole('radio', { name: 'Still to pay' }));

    expect(within(dialog).getByText('Stays due, shown as overdue')).toBeInTheDocument();
    // August's date comes first, so today's isn't offered until that's dealt with
    expect(within(dialog).queryByRole('checkbox', { name: /Netflix/ })).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Confirm your current account/)).toHaveValue('3,500.00');
  });

  it('takes off a payment due today once it’s ticked as gone out', async () => {
    const { user, api } = renderDashboard(paydayBudget());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    expect(within(dialog).getByText('Due today')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('checkbox', { name: /Netflix/ }));

    // August's £20 and today's £20
    expect(within(dialog).getByLabelText(/Confirm your current account/)).toHaveValue('3,460.00');
    // From the balance with last cycle's Netflix taken off, then today's
    expect(dialog).toHaveTextContent(
      'Projected: £980.00 + £2,500.00 pay − £20.00 gone out. Adjust if your bank says otherwise.'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));

    expect(await within(dialog).findByText('New cycle started')).toBeInTheDocument();
    expect(dialog).toHaveTextContent('Netflix was recorded as paid.');
    expect(api.callsTo('StartPaydayCycle')).toEqual([
      {
        input: expect.objectContaining({
          alreadyPaid: { recurringPaymentIds: ['netflix'], oneOffPaymentIds: [] }
        })
      }
    ]);
  });

  it('adds a top-up into savings, and asks about savings balances only if wanted', async () => {
    const data = paydayBudget();
    data.accounts = [
      {
        id: 'isa',
        name: 'Cash ISA',
        kind: 'SAVINGS',
        balance: 8650,
        counts: false,
        interestRate: 4.5,
        purpose: null,
        balanceUpdatedAt: String(Date.now() - 40 * 86_400_000)
      }
    ];
    data.recurringPayments[0] = {
      ...data.recurringPayments[0],
      name: 'ISA top-up',
      paysInto: 'isa'
    };
    const { user, api } = renderDashboard(data);

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    expect(within(dialog).getByText('Adds £20.00 to Cash ISA')).toBeInTheDocument();
    expect(within(dialog).getByText('Into Cash ISA · due today')).toBeInTheDocument();

    // Folded until asked for, saying which balance is old
    const savings = within(dialog).getByRole('button', { name: /Update your savings too/ });
    expect(savings).toHaveTextContent('1 account · Cash ISA updated 6 weeks ago');
    await user.click(savings);
    const isa = within(dialog).getByLabelText('Cash ISA');
    expect(isa).toHaveValue('8,670.00');
    expect(within(dialog).getByText('Includes £20.00 paid in')).toBeInTheDocument();

    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));
    expect(await within(dialog).findByText(/£20.00 added to Cash ISA/)).toBeInTheDocument();
    // Left as filled in, so the API adds the top-up itself
    expect(api.callsTo('StartPaydayCycle')).toEqual([
      { input: expect.objectContaining({ accountBalances: [] }) }
    ]);
  });

  it('moves a ticked top-up into another account to spend from', async () => {
    const data = paydayBudget();
    data.accounts = [
      {
        id: 'joint',
        name: 'Joint bills',
        kind: 'SPENDING',
        balance: 2105,
        counts: true,
        interestRate: null,
        purpose: null,
        balanceUpdatedAt: apiDateFromToday(0)
      }
    ];
    data.recurringPayments[0] = {
      ...data.recurringPayments[0],
      name: 'Joint bills top-up',
      paysInto: 'joint'
    };
    const { user } = renderDashboard(data);

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    expect(
      within(dialog).getByText('From Current account into Joint bills · due today')
    ).toBeInTheDocument();
    await user.click(within(dialog).getByRole('checkbox', { name: /Joint bills top-up/ }));

    expect(dialog).toHaveTextContent('The £20.00 is added to Joint bills.');
    expect(dialog).toHaveTextContent('− £20.00 to Joint bills');
    await user.click(within(dialog).getByRole('button', { name: /Update your other accounts/ }));
    expect(dialog).toHaveTextContent('With the £40.00 top-up');
    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));

    expect(await within(dialog).findByText(/£40.00 moved to Joint bills/)).toBeInTheDocument();
  });

  it('can be skipped and shown again', async () => {
    const { user } = renderDashboard(paydayBudget());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    await user.click(within(dialog).getByRole('button', { name: 'Skip for now' }));

    expect(await screen.findByText('Payday prompt skipped')).toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Show again' }));

    expect(await screen.findByRole('dialog', { name: 'It’s payday' })).toBeInTheDocument();
  });

  it('says when it is catching up on a payday that has been', async () => {
    setToday('2026-10-04');
    renderDashboard(paydayBudget());

    const dialog = await screen.findByRole('dialog', { name: 'Start your new pay cycle' });
    expect(dialog).toHaveTextContent('Payday was Wednesday 30 September · 4 days ago');
  });

  it('offers payments due since a payday that has been, rather than last cycle’s', async () => {
    setToday('2026-10-04');
    const data = paydayBudget();
    // Due today, after the payday being caught up on
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'gym',
      name: 'Gym',
      firstPaymentDate: apiDateFromToday(0),
      nextDueDate: apiDateFromToday(0)
    });
    renderDashboard(data);

    const dialog = await screen.findByRole('dialog', { name: 'Start your new pay cycle' });
    expect(
      within(dialog).getByRole('radiogroup', { name: 'What happened to Netflix' })
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole('radiogroup', { name: 'What happened to Gym' })
    ).not.toBeInTheDocument();
    expect(within(dialog).getByText('Due since payday')).toBeInTheDocument();
    expect(within(dialog).getByRole('checkbox', { name: /Gym/ })).toBeInTheDocument();
  });

  it('leaves out the check when nothing is left over or due since payday', async () => {
    setToday('2026-10-01');
    const data = paydayBudget();
    // Paid for 30 August, so it has moved on, and it isn't due again until 30 October
    data.recurringPayments[0].nextDueDate = apiDate('2026-10-30');
    renderDashboard(data);

    const dialog = await screen.findByRole('dialog', { name: 'Start your new pay cycle' });
    expect(within(dialog).queryByText('Check what’s gone out')).not.toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Confirm your current account/)).toHaveValue('3,500.00');
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
  const movable = () => budget({ cycleStartedOn: apiDate('2026-11-30') });

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
  const renewedBudget = () => {
    const data = budget();
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'breakdown',
      name: 'Breakdown cover',
      amount: 7.5,
      category: 'TRANSPORT',
      firstPaymentDate: apiDate('2025-09-28'),
      nextDueDate: apiDate('2026-10-28'),
      renewalDate: apiDate('2026-09-28'),
      renewalReminder: { off: false, days: 30 }
    });
    return data;
  };

  it('shows one alert at a time, moving between them', async () => {
    const { user } = renderDashboard(renewedBudget());

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

  // Put away with Later until a day, as the API keeps it
  const putAway = (data: ReturnType<typeof renewedBudget>, until: string) => ({
    ...data,
    reminderStates: [
      {
        key: 'renewed:breakdown:2026-09-28',
        read: false,
        cleared: false,
        snoozedUntil: apiDate(until)
      }
    ]
  });

  it('puts a renewal away for three days with Later, on the budget', async () => {
    const { user, unmount, api } = renderDashboard(renewedBudget());

    const alerts = await screen.findByRole('region', { name: 'Alerts' });
    await user.click(within(alerts).getByRole('button', { name: 'Next alert' }));
    await user.click(within(alerts).getByRole('button', { name: 'Later' }));

    // Only due today is left, so there's nothing to page through
    expect(within(alerts).getByRole('region', { name: 'Due today' })).toBeInTheDocument();
    expect(within(alerts).queryByText('1 of 2')).not.toBeInTheDocument();
    // The same as its reminder's Later, so it follows the user to other devices
    expect(api.callsTo('UpdateReminders')).toEqual([
      {
        input: {
          budgetId: 'budget-1',
          keys: ['renewed:breakdown:2026-09-28'],
          action: 'LATER',
          until: '2026-10-11'
        }
      }
    ]);

    // Still away two days later
    unmount();
    vi.setSystemTime(new Date('2026-10-10T09:00:00'));
    renderDashboard(putAway(renewedBudget(), '2026-10-11'));
    await screen.findByRole('region', { name: 'Alerts' });
    expect(screen.queryByText('Breakdown cover has renewed')).not.toBeInTheDocument();
    expect(screen.queryByText('1 of 2')).not.toBeInTheDocument();
  });

  it('flags a renewal coming up within its reminder, after one that has gone by', async () => {
    // Car insurance is paid yearly on 24 October, 16 days away, with a reminder a month before
    const data = renewedBudget();
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'car',
      name: 'Car insurance',
      amount: 612,
      category: 'FINANCES',
      frequency: 'ANNUALLY',
      firstPaymentDate: apiDate('2023-10-24'),
      nextDueDate: apiDate('2026-10-24'),
      renewalDate: null,
      renewalReminder: { off: false, days: 30 }
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
    const data = budget();
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'car',
      name: 'Car insurance',
      amount: 612,
      frequency: 'ANNUALLY',
      firstPaymentDate: apiDate('2023-10-24'),
      nextDueDate: apiDate('2026-10-24'),
      renewalDate: null,
      renewalReminder: { off: true, days: null }
    });
    renderDashboard(data);

    await screen.findByRole('region', { name: 'Alerts' });
    expect(screen.queryByText(/Car insurance renews/)).not.toBeInTheDocument();
  });

  it('asks again once the day it was put away until comes', async () => {
    vi.setSystemTime(new Date('2026-10-11T09:30:00'));
    renderDashboard(putAway(renewedBudget(), '2026-10-11'));

    expect(await screen.findByText('1 of 2')).toBeInTheDocument();
  });

  it('puts a payment gone by unpaid first, to mark paid', async () => {
    const data = renewedBudget();
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'spotify',
      name: 'Spotify',
      firstPaymentDate: apiDate('2026-01-07'),
      nextDueDate: apiDate('2026-10-07')
    });
    const { user, api } = renderDashboard(data);

    const alerts = await screen.findByRole('region', { name: 'Alerts' });
    expect(within(alerts).getByText('1 of 3')).toBeInTheDocument();
    const overdue = within(alerts).getByRole('region', { name: 'Spotify is overdue' });
    expect(overdue).toHaveTextContent('Spotify · £20.00 was due Wed 7 Oct');

    await user.click(within(overdue).getByRole('button', { name: 'Mark as paid' }));

    await waitFor(() =>
      expect(api.callsTo('MarkPaymentsPaid')[0]).toMatchObject({
        input: { recurringPaymentIds: ['spotify'] }
      })
    );
  });
});
