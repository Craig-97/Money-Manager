import { ReactNode } from 'react';
import { cn } from '~/lib/cn';

interface ReminderWayProps {
  icon: ReactNode;
  title: string;
  text: string;
  // On the right: whether it's on, or a button to set it up
  end: ReactNode;
  // Not available yet, so it's dimmed
  muted?: boolean;
  // Roomier, for the profile's settings
  size?: 'sm' | 'md';
}

/* One way reminders reach you: in the app, a calendar, or email */
export const ReminderWay = ({
  icon,
  title,
  text,
  end,
  muted = false,
  size = 'sm'
}: ReminderWayProps) => (
  <div
    className={cn(
      'flex min-h-[52px] items-center gap-3',
      size === 'md' && 'gap-3.5',
      muted && 'opacity-60'
    )}>
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-text',
        size === 'md' ? 'size-10' : 'size-[38px]'
      )}>
      {icon}
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className={cn('font-bold', size === 'md' ? 'text-[15px]' : 'text-sm')}>{title}</span>
      <span
        className={cn(
          'text-muted',
          size === 'md' ? 'text-[13px] font-medium' : 'text-xs font-semibold'
        )}>
        {text}
      </span>
    </span>
    {end}
  </div>
);
