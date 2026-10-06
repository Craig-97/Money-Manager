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

// Everything due today, so it's always before the next payday whatever day the tests run
const account = (overrides: Partial<FakeAccount> = {}): FakeAccount => ({
  ...structuredClone(DEFAULT_ACCOUNT),
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
      firstPaymentDate: apiDateFromToday(-31),
      lastPaymentDate: null,
      nextDueDate: apiDateFromToday(0),
      status: 'UNPAID'
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

describe('dashboard', () => {
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
    expect(api.db.account?.recurringPayments[0].status).toBe('SKIPPED');
    expect(api.db.account?.bankBalance).toBe(1000);
    expect(await within(dialog).findByText(/^Skipped this cycle/)).toBeInTheDocument();
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

describe('payday prompt', () => {
  // Wednesday 30 September 2026 is the last day of the month, the accounts' payday. Only Date is
  // faked, so timers and user events run as normal.
  const setToday = (iso: string) => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(`${iso}T09:00:00`));
  };
  beforeEach(() => setToday('2026-09-30'));
  afterEach(() => vi.useRealTimers());

  // A paid recurring payment from the cycle that's ending, with this cycle not started yet
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
          nextDueDate: apiDateFromToday(-1),
          status: 'PAID'
        }
      ],
      oneOffPayments: []
    });

  it('confirms the balance and starts the new cycle', async () => {
    const { user, api } = renderDashboard(paydayAccount());

    const dialog = await screen.findByRole('dialog', { name: 'It’s payday' });
    const balance = within(dialog).getByLabelText(/Confirm your bank balance/);
    expect(balance).toHaveValue('3,500.00');
    expect(within(dialog).getByText('Projected')).toBeInTheDocument();

    await user.clear(balance);
    await user.type(balance, '3,480');
    expect(within(dialog).getByText('Edited')).toBeInTheDocument();
    expect(within(dialog).getByRole('checkbox', { name: /Netflix/ })).toBeChecked();
    await user.click(within(dialog).getByRole('button', { name: 'Start new cycle' }));

    expect(await within(dialog).findByText('New cycle started')).toBeInTheDocument();
    expect(dialog).toHaveTextContent(
      'Bank balance set to £3,480.00. 1 recurring payment was reset to unpaid and moved to the next date.'
    );
    expect(api.callsTo('StartPaydayCycle')).toEqual([
      {
        input: expect.objectContaining({
          accountId: 'account-1',
          bankBalance: 3480,
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
    // Paid on its due date, which is after the payday being caught up on
    data.recurringPayments.push({
      ...data.recurringPayments[0],
      id: 'gym',
      name: 'Gym',
      nextDueDate: apiDateFromToday(0),
      status: 'PAID'
    });
    renderDashboard(data);

    const dialog = await screen.findByRole('dialog', { name: 'Start your new pay cycle' });
    expect(within(dialog).getByRole('checkbox', { name: /Netflix/ })).toBeChecked();
    expect(within(dialog).queryByRole('checkbox', { name: /Gym/ })).not.toBeInTheDocument();
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
