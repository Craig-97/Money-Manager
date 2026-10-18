import { CalendarDays, CircleAlert, Clock, FileText, RefreshCw } from 'lucide-react';
import { cn } from '~/lib/cn';
import { Reminder, ReminderKind } from '~/lib/reminders';

const ICONS: Record<ReminderKind, typeof Clock> = {
  due: Clock,
  overdue: CircleAlert,
  renewal: RefreshCw,
  renewed: RefreshCw,
  note: FileText,
  payday: CalendarDays
};

interface ReminderIconProps {
  reminder: Pick<Reminder, 'kind' | 'read'>;
  className?: string;
}

/* What a reminder is about, in a round badge: red while a payment is overdue, accent while unread */
export const ReminderIcon = ({ reminder, className }: ReminderIconProps) => {
  const Icon = ICONS[reminder.kind];
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-full',
        reminder.kind === 'overdue'
          ? 'bg-expense-bg text-expense'
          : reminder.read
            ? 'border border-border bg-surface-2 text-muted'
            : 'bg-accent-soft text-accent-text',
        className
      )}>
      <Icon size={18} strokeWidth={2.25} />
    </span>
  );
};
