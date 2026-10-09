import { cn } from '~/lib/cn';
import { PayCycle } from '~/lib/payday';
import { cycleStatus, RecurringPayment } from '~/lib/payments';
import { tagClasses } from '../tagClasses';

/* Where a recurring payment stands this cycle: "Unpaid", "1 of 4 paid", "Paid"... */
interface StatusTagProps {
  payment: RecurringPayment;
  cycle: PayCycle;
  className?: string;
}

export const StatusTag = ({ payment, cycle, className }: StatusTagProps) => {
  const { tone, label } = cycleStatus(payment, cycle);
  return (
    <span
      className={cn(
        tagClasses,
        tone === 'skipped' && 'border-transparent bg-accent-soft text-accent-text',
        tone === 'paid' && 'border-transparent bg-income-bg text-income',
        className
      )}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
};
