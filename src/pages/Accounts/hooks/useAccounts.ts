import { useAccountActions } from '~/hooks/useAccountActions';
import { Budget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import {
  accountTotals,
  beforePaydayByAccount,
  hasSeveralSpending,
  isSpending,
  paidIntoAccountOf,
  savingsOf,
  spendingOf,
  toAccounts
} from '~/lib/accounts';
import { debtTotals, isDebt } from '~/lib/debts';
import { roundPence } from '~/lib/format';
import { RecurringPayment, toPayments } from '~/lib/payments';

/* Everything the Accounts page shows and does, worked out from the budget */
export const useAccounts = (budget: Budget) => {
  const { today, holidays, cycle } = usePayCycle(budget.payday);
  const { setCounts } = useAccountActions(budget);

  const accounts = toAccounts(budget.accounts, today);
  const payments = toPayments(budget, { today, holidays });
  const debts = payments
    .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
    .filter(isDebt)
    .filter(debt => debt.debt.balance > 0);
  const totals = accountTotals(accounts, { owed: debtTotals(debts).left });
  const several = hasSeveralSpending(accounts);

  const byAccount = beforePaydayByAccount(accounts, { payments, cycle });
  const spendingRows = byAccount.filter(row => isSpending(row.account));
  const savingsRows = byAccount.filter(row => !isSpending(row.account));
  // The hero adds up the spending accounts that count in free to spend, as the board does
  const countedRows = spendingRows.filter(row => row.account.counts);
  const now = roundPence(countedRows.reduce((sum, row) => sum + row.account.balance, 0));
  const left = roundPence(countedRows.reduce((sum, row) => sum + row.left, 0));
  const paidInto = paidIntoAccountOf(accounts);

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
    beforePayday: {
      spending: spendingRows,
      // The accounts the hero's figures are across
      counted: countedRows.map(row => row.account),
      savings: savingsRows,
      now,
      left,
      goesOut: roundPence(now - left),
      monthlyIncome: budget.monthlyIncome ?? 0,
      // Money moving on payday itself, into or out of the spending accounts
      onPayday: spendingRows.flatMap(row =>
        row.onPayday
          .filter(item => item.amount > 0)
          .map(item => ({ ...item, account: row.account }))
      )
    },
    // Switching an account in or out of free to spend, straight from its row
    setCounts
  };
};

export type Accounts = ReturnType<typeof useAccounts>;
