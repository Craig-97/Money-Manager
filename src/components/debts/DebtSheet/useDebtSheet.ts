import { useShallow } from 'zustand/react/shallow';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { isDebt } from '~/lib/debts';
import { RecurringPayment, toPayments } from '~/lib/payments';
import { useDebtDialogStore } from '~/state/debtDialog';
import { useDebtViewStore } from '~/state/debtView';
import { usePaymentDialogStore } from '~/state/paymentDialog';

/*
 * The debt a name opened, and where its tiles go. Each closes the view and opens its small dialog,
 * which has a back arrow to it; Edit debt opens the full form.
 */
export const useDebtSheet = () => {
  const { budget } = useBudget();
  const { today } = usePayCycle(budget?.payday);
  const { debtId, open, close } = useDebtViewStore(
    useShallow(s => ({ debtId: s.debtId, open: s.open, close: s.close }))
  );
  const dialogs = useDebtDialogStore(
    useShallow(s => ({
      openBalance: s.openBalance,
      openOverpayment: s.openOverpayment,
      openPaySooner: s.openPaySooner,
      openPayments: s.openPayments
    }))
  );
  const openEdit = usePaymentDialogStore(s => s.openEdit);

  const debt = budget
    ? toPayments(budget, today)
        .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
        .filter(isDebt)
        .find(payment => payment.id === debtId)
    : undefined;
  if (!debt) return { open: false, debt: null } as const;

  const then = (run: () => void) => () => {
    close();
    run();
  };
  const fromView = { fromView: true };

  return {
    open,
    debt,
    today,
    close,
    updateBalance: then(() => dialogs.openBalance(debt.id, fromView)),
    overpay: then(() => dialogs.openOverpayment(debt.id, fromView)),
    paySooner: then(() => dialogs.openPaySooner(debt.id, fromView)),
    payments: then(() => dialogs.openPayments(debt.id, fromView)),
    edit: then(() => openEdit('recurring', { paymentId: debt.id, asDebt: true }))
  } as const;
};
