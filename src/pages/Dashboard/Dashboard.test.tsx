import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import { apiDateFromToday, createFakeApi, DEFAULT_ACCOUNT, FakeAccount } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

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
        oneOffPayment: expect.objectContaining({
          account: 'account-1',
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
      expect(api.callsTo('EditAccount')).toEqual([
        { id: 'account-1', account: { bankBalance: 1500 } }
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

  it("doesn't show once this cycle has started", async () => {
    renderDashboard();

    await screen.findByRole('heading', { name: 'Dashboard' });
    expect(screen.queryByRole('dialog', { name: 'It’s payday' })).not.toBeInTheDocument();
  });
});
