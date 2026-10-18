import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { apiDate, createFakeApi, DEFAULT_ACCOUNT, FakeRecurringPayment } from '~/test/fakeApi';
import { renderApp } from '~/test/renderApp';

const loan: FakeRecurringPayment = {
  id: 'car-finance',
  name: 'Car finance',
  amount: 245,
  category: 'LOAN',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-15'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null,
  renewalReminderDays: 0,
  debt: { balance: 6860, startingBalance: 12000, apr: 6.9, balanceUpdatedAt: null }
};

const renderDebts = (recurringPayments = DEFAULT_ACCOUNT.recurringPayments) =>
  renderApp({
    route: '/debts',
    api: createFakeApi({ account: { ...structuredClone(DEFAULT_ACCOUNT), recurringPayments } })
  });

describe('Debts', () => {
  it('lists only the payments tracked as debts, with what is left', async () => {
    renderDebts([...DEFAULT_ACCOUNT.recurringPayments, loan]);

    const list = await screen.findByRole('region', { name: 'Your debts' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list).getByText('Car finance')).toBeInTheDocument();
    expect(within(list).getByText('£245.00 a payment · 6.9% APR')).toBeInTheDocument();
    expect(within(list).getAllByText('£6,860.00')).toHaveLength(2);
  });

  it('offers to add one when there are none', async () => {
    const { user } = renderDebts();

    expect(await screen.findByText('No debts yet')).toBeInTheDocument();

    await user.click(
      within(screen.getByRole('region', { name: 'Your debts' })).getByRole('button', {
        name: 'Add a debt'
      })
    );

    expect(
      await screen.findByRole('dialog', { name: 'Add recurring payment' })
    ).toBeInTheDocument();
  });
});
