import { useState } from 'react';
import { useReminderActions } from '~/hooks/useReminderActions';
import { useReminderOpen } from '~/hooks/useReminderOpen';
import { useReminders } from '~/hooks/useReminders';
import { Reminder } from '~/lib/reminders';

/* The bell: whether it's open, what's new, and what can be done from it */
export const useBell = () => {
  const [open, setOpen] = useState(false);
  const reminders = useReminders();
  const actions = useReminderActions(reminders);
  const openOf = useReminderOpen(reminders.accountId ?? '');

  return {
    open,
    setOpen,
    close: () => setOpen(false),
    today: reminders.today,
    fresh: reminders.fresh,
    unread: reminders.unread,
    /* Its one thing to do; doing it puts the bell away, as it may open a dialog or another page */
    openOf: (reminder: Reminder) => {
      const action = openOf(reminder);
      const closing = (run: () => void) => () => {
        setOpen(false);
        run();
      };
      return action
        ? {
            ...action,
            run: closing(action.run),
            also: action.also ? { ...action.also, run: closing(action.also.run) } : null
          }
        : null;
    },
    later: (reminder: Reminder) => void actions.later(reminder),
    clear: (reminder: Reminder) => void actions.clear(reminder),
    clearAll: () => void actions.clearAll(reminders.fresh),
    markAllRead: () => actions.markRead(reminders.fresh)
  };
};

export type Bell = ReturnType<typeof useBell>;
