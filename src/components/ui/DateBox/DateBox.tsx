import { cn } from '~/lib/cn';
import { formatShortMonth } from '~/lib/dates';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface DateBoxProps {
  date: Date;
  // What goes above the day: the month in a list grouped by nothing, the weekday in one already
  // grouped by month or within a pay cycle
  top?: 'month' | 'weekday';
  // The next one due, or payday, in the accent colour
  accent?: boolean;
  size?: 'md' | 'sm';
}

/* A date as a small calendar box: the month or weekday over the day of the month */
export const DateBox = ({ date, top = 'month', accent = false, size = 'md' }: DateBoxProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex shrink-0 flex-col items-center justify-center rounded-[14px] border py-1.5 leading-none',
      size === 'md' ? 'w-[52px]' : 'w-[46px]',
      accent ? 'border-transparent bg-accent-soft' : 'border-border bg-surface-2'
    )}>
    <span
      className={cn(
        'text-[10px] font-extrabold tracking-[0.06em] uppercase',
        accent ? 'text-accent-text' : 'text-muted'
      )}>
      {top === 'month' ? formatShortMonth(date) : WEEKDAYS[date.getDay()]}
    </span>
    <span
      className={cn('mt-[3px] num font-extrabold', size === 'md' ? 'text-[19px]' : 'text-[17px]')}>
      {date.getDate()}
    </span>
  </span>
);
