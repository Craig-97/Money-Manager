import { cn } from '~/lib/cn';
import { MonthRow, movedTitle } from '../../../forecastModel';

/* A payday moved by a bank holiday, or by the person */
export const BankHolidayTag = ({ row, className }: { row: MonthRow; className?: string }) =>
  row.movedFrom ? (
    <span
      title={movedTitle(row)}
      className={cn(
        'inline-flex items-center rounded-full bg-accent-soft font-bold whitespace-nowrap text-accent-text',
        className
      )}>
      {row.movedBy === 'you' ? 'Moved' : 'Bank holiday'}
    </span>
  ) : null;
