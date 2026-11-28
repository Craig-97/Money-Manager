import { PaymentActions } from '~/hooks/usePaymentActions';
import { PayCycle } from '~/lib/payday';
import { Payment } from '~/lib/payments';
import { PaymentAmount, PaymentMenu } from '../../PaymentParts';

interface PaymentRowEndProps {
  payment: Payment;
  cycle: PayCycle;
  today: Date;
  actions: PaymentActions;
  noteCount: number;
}

/* A table row's last two cells: the amount, then the payment's menu */
export const PaymentRowEnd = ({
  payment,
  cycle,
  today,
  actions,
  noteCount
}: PaymentRowEndProps) => (
  <>
    <span role="cell" className="text-right">
      <PaymentAmount payment={payment} className="text-[15px]" />
    </span>
    <span role="cell" className="flex justify-end">
      <PaymentMenu
        payment={payment}
        cycle={cycle}
        today={today}
        actions={actions}
        noteCount={noteCount}
      />
    </span>
  </>
);
