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
  // Stacked, for the bell's narrower list
  compact?: boolean;
}

const smallButton = 'h-[38px] px-3.5 text-[13px]';

/*
 * A reminder that has gone off: what it's about and when it went off, a line each, then the thing
 * to do about it and Later: beside the text on the page, under it in the bell. Unread ones sit on
 * a tint. An overdue payment has no ✕, as it only goes once it's paid or skipped.
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
    <div className={cn('flex shrink-0 items-center gap-1.5', compact && 'mt-2.5 -ml-1')}>
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

  return (
    <article
      aria-label={reminder.title}
      className={cn(
        'flex gap-3.5 rounded-[22px] border',
        compact ? 'p-3.5' : 'items-center px-4 py-3',
        reminder.read ? 'border-transparent' : 'border-border bg-surface-2'
      )}>
      <ReminderIcon reminder={reminder} />
      <div className="flex min-w-0 flex-1 flex-col">
        {compact ? <p className="num text-xs font-semibold text-muted">{fired}</p> : null}
        <h3 title={reminder.title} className="truncate text-[15px] leading-[1.35] font-bold">
          {reminder.title}
          {reminder.read ? null : <span className="sr-only"> (new)</span>}
        </h3>
        <p
          title={reminder.body}
          className="mt-0.5 truncate text-sm leading-[1.45] font-medium text-muted">
          {compact ? null : <span className="num">{fired} · </span>}
          {reminder.body}
        </p>
        {compact ? actions : null}
      </div>
      {compact ? null : actions}
      {canClear(reminder) ? (
        <IconButton
          aria-label={`Clear: ${reminder.title}`}
          onClick={onClear}
          className={cn('size-10', compact && '-mt-1.5 -mr-1.5')}>
          <X size={17} strokeWidth={2.25} aria-hidden="true" />
        </IconButton>
      ) : compact ? null : (
        // Keeps the actions lined up with the rows that have a ✕
        <span aria-hidden="true" className="size-10 shrink-0" />
      )}
    </article>
  );
};
