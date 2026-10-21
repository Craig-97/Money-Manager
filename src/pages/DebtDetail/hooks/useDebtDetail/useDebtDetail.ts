import { Budget } from '~/hooks/useBudget';
import { useDebtActions } from '~/hooks/useDebtActions';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaySooner } from '~/hooks/usePaySooner';
import { isDebt } from '~/lib/debts';
import { RecurringPayment, toPayments } from '~/lib/payments';

/* One debt, and paying it off sooner: the hero's clear-by date follows the extra being tried */
export const useDebtDetail = (budget: Budget, id: string) => {
  const { today } = usePayCycle(budget.payday);
  const actions = useDebtActions(budget.id);

  const debt = toPayments(budget, today)
    .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
    .filter(isDebt)
    .find(payment => payment.id === id);
  const sooner = usePaySooner({ debt, today, onPayMore: actions.payMore });
  if (!sooner) return null;

  return { ...sooner, today, actions };
};

export type DebtDetailModel = NonNullable<ReturnType<typeof useDebtDetail>>;
