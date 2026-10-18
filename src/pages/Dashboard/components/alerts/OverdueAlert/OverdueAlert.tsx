import { Check, CircleAlert } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { daysBetween } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { formatShortDate, Payment } from '~/lib/payments';
import {
  alertSublineClasses,
  alertTextClasses,
  alertTitleClasses,
  laterClasses
} from '../alertClasses';

interface OverdueAlertProps {
  payment: Payment;
  // Its date that's gone by unpaid
  due: Date;
  today: Date;
  onLater: () => void;
  onPay: () => void;
}

/*
 * A payment whose date has gone by without being paid or skipped. It stays until it's dealt with;
 * Later only puts it away until tomorrow. Worded as its reminder is.
 */
export const OverdueAlert = ({ payment, due, today, onLater, onPay }: OverdueAlertProps) => {
  const days = daysBetween(due, today);
  return (
    <>
      <div className="flex min-w-0 grow items-center gap-3 md:min-w-[200px] md:gap-4">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-expense-bg text-expense md:size-11">
          <CircleAlert size={20} className="size-[18px] md:size-5" aria-hidden="true" />
        </span>
        <div className={alertTextClasses}>
          <p className={alertTitleClasses}>
            {payment.name} · <span className="num">{formatMoney(payment.amount)}</span> was due{' '}
            {formatShortDate(due, today)}
          </p>
          <p className={alertSublineClasses}>
            <span className="font-bold text-expense">Overdue</span> ·{' '}
            {days === 1 ? '1 day' : `${days} days`} unpaid ·{' '}
            {payment.kind === 'recurring' ? 'mark it paid or skip it' : 'mark it paid'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex md:gap-1.5">
        <Button onClick={onLater} className={laterClasses}>
          Later
        </Button>
        <Button variant="solid" onClick={onPay}>
          <Check size={16} strokeWidth={2.5} aria-hidden="true" />
          Mark as paid
        </Button>
      </div>
    </>
  );
};
