import { useBudget } from '~/hooks/useBudget';
import { useDebtActions } from '~/hooks/useDebtActions';
import { usePayCycle } from '~/hooks/usePayCycle';
import { isDebt } from '~/lib/debts';
import { RecurringPayment, toPayments } from '~/lib/payments';
import { DebtSheet } from '../DebtSheet';
import { OverpaymentDialog } from '../OverpaymentDialog';
import { PaymentsDialog } from '../PaymentsDialog';
import { PaySoonerDialog } from '../PaySoonerDialog';
import { UpdateBalanceDialog } from '../UpdateBalanceDialog';

/*
 * A debt's view and its small dialogs, once for the whole app, so a debt can be opened from Debts
 * or from its payment on any page
 */
export const DebtDialogs = () => {
  const { budget } = useBudget();
  const { today } = usePayCycle(budget?.payday);
  const actions = useDebtActions(budget?.id ?? '');
  const debts = budget
    ? toPayments(budget, today)
        .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
        .filter(isDebt)
    : [];

  return (
    <>
      <DebtSheet />
      <UpdateBalanceDialog debts={debts} today={today} onUpdate={actions.updateBalance} />
      <OverpaymentDialog debts={debts} onOverpay={actions.overpay} />
      <PaymentsDialog
        debts={debts}
        today={today}
        onUndoOverpayment={(id, name) => void actions.undoOverpayment(id, name)}
      />
      <PaySoonerDialog debts={debts} today={today} onPayMore={actions.payMore} />
    </>
  );
};
