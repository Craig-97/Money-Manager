import { cn } from '~/lib/cn';

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

interface DateBoxProps {
  date: Date;
  // Payday's own date, in the accent colour
  accent?: boolean;
  compact?: boolean;
}

/* A payment's date as a small calendar box: the weekday over the day of the month */
export const DateBox = ({ date, accent = false, compact = false }: DateBoxProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex shrink-0 flex-col items-center justify-center rounded-[14px] border py-1.5 leading-none',
      compact ? 'w-[46px]' : 'w-[52px]',
      accent ? 'border-transparent bg-accent-soft' : 'border-border bg-surface-2'
    )}>
    <span
      className={cn(
        'text-[10px] font-extrabold tracking-[0.06em]',
        accent ? 'text-accent-text' : 'text-muted'
      )}>
      {WEEKDAYS[date.getDay()]}
    </span>
    <span className={cn('mt-[3px] font-extrabold', compact ? 'text-[17px]' : 'text-[19px]')}>
      {date.getDate()}
    </span>
  </span>
);
