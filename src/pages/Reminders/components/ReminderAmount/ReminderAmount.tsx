import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';

/* "−£120.00" in red for money out, "+£3,600.00" in green for money in */
export const ReminderAmount = ({
  amount,
  className
}: {
  amount: number | null;
  className?: string;
}) =>
  amount === null ? null : (
    <span className={cn('num font-bold', amount < 0 ? 'text-expense' : 'text-income', className)}>
      {amount > 0 ? '+' : ''}
      {formatBalance(amount)}
    </span>
  );
