import { Clock, X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { ReminderOpen } from '~/hooks/useReminderOpen';
import { cn } from '~/lib/cn';
import { canClear, firedText, Reminder } from '~/lib/reminders';
import { ReminderIcon } from '../ReminderIcon';

interface ReminderCardProps {
  reminder: Reminder;
  today: Date;
  open: ReminderOpen | null;
  onLater: () => void;
  onClear: () => void;
  // For the bell's narrower list
  compact?: boolean;
}

const smallButton = 'h-[38px] px-3.5 text-[13px]';

/*
 * A reminder that has gone off, as the design draws it: what it's about with when it went off,
 * a line saying more, then the thing to do about it and Later. Unread ones sit on a tint. An
 * overdue payment has no ✕, as it only goes once it's paid.
 */
export const ReminderCard = ({
  reminder,
  today,
  open,
  onLater,
  onClear,
  compact = false
}: ReminderCardProps) => {
  const fired = (
    <span className={reminder.kind === 'overdue' ? 'font-bold text-expense' : undefined}>
      {firedText(reminder, today)}
    </span>
  );
  const actions = (
    <div className="mt-2.5 -ml-1 flex flex-wrap items-center gap-1.5">
      {open ? (
        <Button onClick={open.run} className={cn(smallButton, 'font-bold')}>
          {open.label}
        </Button>
      ) : null}
      <Button variant="ghost" onClick={onLater} className={smallButton}>
        <Clock size={15} strokeWidth={2.25} aria-hidden="true" />
        Later
      </Button>
    </div>
  );
  const title = (
    <h3 title={reminder.title} className="min-w-0 truncate text-[15px] leading-[1.35] font-bold">
      {reminder.title}
      {reminder.read ? null : <span className="sr-only"> (new)</span>}
    </h3>
  );

  return (
    <article
      aria-label={reminder.title}
      className={cn(
        'flex gap-3.5 rounded-[22px] border',
        compact ? 'p-3.5' : 'p-4',
        reminder.read ? 'border-transparent' : 'border-border bg-surface-2'
      )}>
      <ReminderIcon reminder={reminder} />
      <div className="flex min-w-0 flex-1 flex-col">
        {compact ? (
          // The bell's list is narrower, so when it went off goes above the title
          <>
            <p className="num text-xs font-semibold text-muted">{fired}</p>
            {title}
          </>
        ) : (
          <div className="flex items-start justify-between gap-3">
            {title}
            <span className="mt-0.5 shrink-0 num text-xs font-semibold text-muted">{fired}</span>
          </div>
        )}
        <p
          title={reminder.body}
          className="mt-0.5 truncate text-sm leading-[1.45] font-medium text-muted">
          {reminder.body}
        </p>
        {actions}
      </div>
      {canClear(reminder) ? (
        <IconButton
          aria-label={`Clear: ${reminder.title}`}
          onClick={onClear}
          className="-mt-1.5 -mr-1.5 size-10">
          <X size={17} strokeWidth={2.25} aria-hidden="true" />
        </IconButton>
      ) : null}
    </article>
  );
};
