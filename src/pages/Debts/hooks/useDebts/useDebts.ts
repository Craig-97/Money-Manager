import { useState } from 'react';
import { Account } from '~/hooks/useAccount';
import { useDebtActions } from '~/hooks/useDebtActions';
import { usePayCycle } from '~/hooks/usePayCycle';
import { debtTotals, isDebt, monthlyInterest, paidOffThisCycle, simulatePayoff } from '~/lib/debts';
import { datesDue, RecurringPayment, toPayments } from '~/lib/payments';
import { DebtSort, sortDebts } from '../../debtsModel';

/* The account's debts, what they add up to, and when they'd be paid off as things are */
export const useDebts = (account: Account) => {
  const { today, cycle } = usePayCycle(account.payday);
  const actions = useDebtActions(account.id);
  const [sort, setSort] = useState<DebtSort>('rate');

  const debts = toPayments(account, today)
    .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
    .filter(isDebt);
  // As things are: each debt keeps its own payment, with nothing extra
  const base = simulatePayoff(debts);
  const dueBeforePayday = debts
    .filter(debt => datesDue(debt, cycle).length > 0)
    .toSorted((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());

  return {
    today,
    cycle,
    debts,
    sorted: sortDebts(debts, { sort, clearedIn: base.clearedIn }),
    sort,
    setSort,
    totals: debtTotals(debts),
    base,
    interest: monthlyInterest(debts),
    paidThisCycle: paidOffThisCycle(debts),
    dueBeforePayday,
    // The rest, next due after payday, soonest first
    dueAfterPayday: debts
      .filter(debt => debt.dueDate && !dueBeforePayday.includes(debt))
      .toSorted((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime()),
    actions
  };
};

export type Debts = ReturnType<typeof useDebts>;
