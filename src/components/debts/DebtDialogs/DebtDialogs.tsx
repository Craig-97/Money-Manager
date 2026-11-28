import { useBudget } from '~/hooks/useBudget';
import { useDebtActions } from '~/hooks/useDebtActions';
import { usePayCycle } from '~/hooks/usePayCycle';
import { isDebt } from '~/lib/debts';
import { toPayments } from '~/lib/payments';
import { DebtSheet } from '../DebtSheet';
import { OverpaymentDialog } from '../OverpaymentDialog';
import { PaySoonerDialog } from '../PaySoonerDialog';
import { UpdateBalanceDialog } from '../UpdateBalanceDialog';

/*
 * A debt's view and its small dialogs, once for the whole app, so a debt can be opened from Debts
 * or from its payment on any page
 */
export const DebtDialogs = () => {
  const { budget } = useBudget();
  const { today, holidays } = usePayCycle(budget?.payday);
  const actions = useDebtActions(budget?.id ?? '');
  const debts = budget ? toPayments(budget, { today, holidays }).filter(isDebt) : [];

  return (
    <>
      <DebtSheet />
      <UpdateBalanceDialog debts={debts} today={today} onUpdate={actions.updateBalance} />
      <OverpaymentDialog debts={debts} onOverpay={actions.overpay} />
      <PaySoonerDialog debts={debts} today={today} onPayMore={actions.payMore} />
    </>
  );
};
