import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UpdateAccountDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import {
  Account,
  accountTotals,
  beforePaydayByAccount,
  hasSeveralSpending,
  isSpending,
  isStale,
  paidIntoAccountOf,
  savingsOf,
  spendingOf,
  toAccounts,
  unchosenOf
} from '~/lib/accounts';
import { debtTotals, isDebt } from '~/lib/debts';
import { getApiErrorMessage } from '~/lib/errors';
import { RecurringPayment, toPayments } from '~/lib/payments';
import { showToast } from '~/state/toast';

export type AccountsView = 'balances' | 'before';

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

/* Everything the Accounts page shows and does, worked out from the budget */
export const useAccounts = (budget: Budget) => {
  const { today, cycle } = usePayCycle(budget.payday);
  const [updateAccount] = useMutation(UpdateAccountDocument);
  const [chosenView, setView] = useState<AccountsView>('balances');

  const accounts = toAccounts(budget.accounts, today);
  const payments = toPayments(budget, today);
  const debts = payments
    .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
    .filter(isDebt)
    .filter(debt => debt.debt.balance > 0);
  const totals = accountTotals(accounts, { owed: debtTotals(debts).left });
  // With one account to spend from there's nothing to split by account, so only Balances shows
  const several = hasSeveralSpending(accounts);
  const view = several ? chosenView : 'balances';

  const byAccount = beforePaydayByAccount(accounts, { payments, cycle });
  const spendingRows = byAccount.filter(row => isSpending(row.account));
  const savingsRows = byAccount.filter(row => !isSpending(row.account));
  const now = roundPence(spendingRows.reduce((sum, row) => sum + row.account.balance, 0));
  const left = roundPence(spendingRows.reduce((sum, row) => sum + row.left, 0));
  const paidInto = paidIntoAccountOf(accounts);

  // Switching an account in or out of free to spend, straight from its row
  const setCounts = async (account: Account, counts: boolean) => {
    try {
      await updateAccount({
        variables: { id: account.id, input: { counts } },
        optimisticResponse: {
          updateAccount: {
            __typename: 'AccountResponse',
            account: {
              __typename: 'Account',
              id: account.id,
              name: account.name,
              kind: account.kind,
              balance: account.balance,
              counts,
              paidInto: account.paidInto,
              interestRate: account.interestRate,
              purpose: account.purpose,
              balanceUpdatedAt: String(account.balanceUpdatedAt.getTime())
            },
            budget: {
              __typename: 'Budget',
              id: budget.id,
              bankBalance: budget.bankBalance + (counts ? account.balance : -account.balance),
              accounts: budget.accounts.map(item =>
                item.id === account.id ? { ...item, counts } : item
              ),
              recurringPayments: budget.recurringPayments ?? [],
              oneOffPayments: budget.oneOffPayments ?? []
            }
          }
        }
      });
      showToast({
        message: counts
          ? `${account.name} now counts in free to spend`
          : `${account.name} is kept out of free to spend`
      });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't change that. Try again.") });
    }
  };

  return {
    today,
    cycle,
    accounts,
    spending: spendingOf(accounts),
    savings: savingsOf(accounts),
    several,
    paidInto,
    debts,
    totals,
    view,
    setView,
    // Recurring expenses that don't say which account they go out of, once there's a choice
    unchosen: unchosenOf(payments, accounts),
    beforePayday: {
      spending: spendingRows,
      savings: savingsRows,
      now,
      left,
      goesOut: roundPence(now - left),
      monthlyIncome: budget.monthlyIncome ?? 0,
      // Money moving on payday itself, into or out of the spending accounts
      onPayday: spendingRows.flatMap(row => row.onPayday.filter(item => item.amount > 0))
    },
    // The first balance that may be out of date, for the mobile banner
    stale: accounts.find(account => !account.paidInto && isStale(account, today)) ?? null,
    setCounts: (account: Account, counts: boolean) => void setCounts(account, counts)
  };
};

export type Accounts = ReturnType<typeof useAccounts>;
