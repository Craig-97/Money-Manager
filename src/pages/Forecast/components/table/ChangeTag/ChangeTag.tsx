import { cn } from '~/lib/cn';
import { MonthRow, signedPercent } from '../../../forecastModel';

/* How much the balance grew or shrank on the month before */
export const ChangeTag = ({ row, className }: { row: MonthRow; className?: string }) => (
  <span
    className={cn(
      'inline-block rounded-full num font-bold',
      row.change === null
        ? 'bg-surface-2 text-faint'
        : row.change < 0
          ? 'bg-expense-bg text-expense'
          : 'bg-income-bg text-income',
      className
    )}>
    {row.change === null ? '—' : signedPercent(row.change)}
  </span>
);
