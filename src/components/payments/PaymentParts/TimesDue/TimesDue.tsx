import { Tooltip } from '~/components/ui/Tooltip';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import { datesDue, formatShortDate, Payment } from '~/lib/payments';
import { tagClasses } from '../tagClasses';

interface TimesDueProps {
  payment: Payment;
  cycle: PayCycle;
  today: Date;
  // The dates on hover and focus; left out where the row itself is the button
  hint?: boolean;
}

/*
 * "×2" by the name of a payment listed once but due more than once before payday, such as a
 * weekly one. Nothing for a payment due once.
 */
export const TimesDue = ({ payment, cycle, today, hint = true }: TimesDueProps) => {
  const dates = datesDue(payment, cycle);
  if (dates.length < 2) return null;
  const badge = (
    <span
      tabIndex={hint ? 0 : undefined}
      className={cn(tagClasses, 'h-[22px] shrink-0 px-2 num text-[11px]')}>
      <span aria-hidden="true">×{dates.length}</span>
      <span className="sr-only">, due {dates.length} times before payday</span>
    </span>
  );
  const label = (
    <>
      <span className="font-bold">Due {dates.length} times before payday</span>
      {dates.map(date => (
        <span
          key={date.getTime()}
          className={cn(
            'num font-bold',
            payment.signedAmount < 0 ? 'text-expense' : 'text-income'
          )}>
          {formatShortDate(date, today)} {formatPayment(payment.signedAmount)}
        </span>
      ))}
    </>
  );
  return hint ? (
    <Tooltip label={label} side="top" tone="card">
      {badge}
    </Tooltip>
  ) : (
    badge
  );
};
