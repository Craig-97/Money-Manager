import { Check, CircleAlert } from 'lucide-react';
import { Alert } from '~/components/alerts';
import { daysBetween } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { formatShortDate, Payment } from '~/lib/payments';

interface OverdueAlertProps {
  payment: Payment;
  // Its date that's gone by unpaid
  due: Date;
  today: Date;
  onLater: () => void;
  onPay: () => void;
}

/*
 * A payment whose date has gone by without being paid or skipped. It stays until it's dealt with,
 * so it can't be cleared; Later only puts it away until tomorrow. Worded as its reminder is.
 */
export const OverdueAlert = ({ payment, due, today, onLater, onPay }: OverdueAlertProps) => {
  const days = daysBetween(due, today);
  return (
    <Alert
      icon={CircleAlert}
      tone="expense"
      title={
        <>
          {payment.name} · <span className="num">{formatMoney(payment.amount)}</span> was due{' '}
          {formatShortDate(due, today)}
        </>
      }
      subline={
        <>
          <span className="font-bold text-expense">Overdue</span> ·{' '}
          {days === 1 ? '1 day' : `${days} days`} unpaid ·{' '}
          {payment.kind === 'recurring' ? 'mark it paid or skip it' : 'mark it paid'}
        </>
      }
      onLater={onLater}
      action={{ label: 'Mark as paid', icon: Check, onClick: onPay }}
    />
  );
};
