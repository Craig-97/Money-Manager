import { Account } from '~/hooks/useAccount';
import { usePayCycle } from '~/hooks/usePayCycle';
import { debtTotals, isDebt } from '~/lib/debts';
import { RecurringPayment, toPayments } from '~/lib/payments';

/* The account's debts and what they add up to */
export const useDebts = (account: Account) => {
  const { today } = usePayCycle(account.payday);
  const debts = toPayments(account, today)
    .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
    .filter(isDebt);

  return { debts, totals: debtTotals(debts) };
};
