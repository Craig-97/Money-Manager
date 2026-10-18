import { cn } from '~/lib/cn';
import { dateBox } from '../../remindersModel';

/* A day in a small box, the weekday (or month) over the date. Paydays are tinted. */
export const DateBox = ({
  date,
  today,
  accent = false
}: {
  date: Date;
  today: Date;
  accent?: boolean;
}) => {
  const { top, day } = dateBox(date, today);
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex w-[52px] shrink-0 flex-col items-center justify-center rounded-[14px] border py-1.5 leading-none',
        accent ? 'border-transparent bg-accent-soft' : 'border-border bg-surface-2'
      )}>
      <span
        className={cn(
          'text-[10px] font-extrabold tracking-[0.06em]',
          accent ? 'text-accent-text' : 'text-muted'
        )}>
        {top}
      </span>
      <span className="mt-[3px] num text-[19px] font-extrabold">{day}</span>
    </span>
  );
};
