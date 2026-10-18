import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useReminderActions } from '~/hooks/useReminderActions';
import { useReminderOpen } from '~/hooks/useReminderOpen';
import { useReminders } from '~/hooks/useReminders';
import { filterReminders, Reminder, ReminderFilter } from '~/lib/reminders';
import { useNoteDialogStore } from '~/state/noteDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { groupByMonth, RemindersTab } from '../remindersModel';

/*
 * The Reminders page: New and Coming up (?tab=up), the filter on Coming up, and what each
 * reminder's menu does.
 */
export const useRemindersPage = () => {
  const reminders = useReminders();
  const actions = useReminderActions(reminders);
  const openOf = useReminderOpen(reminders.accountId ?? '');
  const openPayment = usePaymentDialogStore(s => s.openEdit);
  const openNote = useNoteDialogStore(s => s.openEdit);
  const [params, setParams] = useSearchParams();
  const tab: RemindersTab = params.get('tab') === 'up' ? 'up' : 'new';
  const [filter, setFilter] = useState<ReminderFilter>('all');
  // The reminder whose timing is being changed
  const [changing, setChanging] = useState<Reminder | null>(null);
  const { today, settings } = reminders;

  const upcoming = filterReminders(reminders.upcoming, filter);

  /* Opening it from Coming up: the payment or note it's about, rather than paying it */
  const openFrom = (reminder: Reminder) => {
    const note = reminder.note ?? reminder.paymentNote;
    if (reminder.kind === 'note' && note)
      return { label: 'Open note', run: () => openNote(note.id) };
    if (reminder.payment) {
      const payment = reminder.payment;
      return {
        label: 'Open payment',
        run: () => openPayment(payment.kind, { paymentId: payment.id })
      };
    }
    return null;
  };

  /* Whether its reminder is on, and turning it off or back on */
  const toggleOf = (reminder: Reminder) => {
    const { payment } = reminder;
    if (reminder.kind === 'payday') {
      return {
        on: settings.payday,
        run: () => void actions.changeSettings({ payday: !settings.payday }, settings)
      };
    }
    if (!payment || (reminder.kind !== 'due' && reminder.kind !== 'renewal')) return null;
    const which = reminder.kind === 'due' ? 'dueReminder' : 'renewalReminder';
    const timing =
      which === 'renewalReminder' && payment.kind === 'recurring'
        ? payment.renewalReminder
        : payment.dueReminder;
    const on = !timing.off;
    return {
      on,
      run: () =>
        void actions.changeTiming(payment, {
          which,
          timing: on ? { off: true, days: null } : { off: false, days: null }
        })
    };
  };

  return {
    ...reminders,
    tab,
    setTab: (next: RemindersTab) =>
      setParams(next === 'up' ? { tab: 'up' } : {}, { replace: true }),
    filter,
    setFilter,
    groups: groupByMonth(upcoming, today),
    upcomingCount: reminders.upcoming.length,
    actions,
    openOf,
    openFrom,
    toggleOf,
    /* Change when: a note's reminders are set in the note, a payment's in a small dialog */
    changeWhen: (reminder: Reminder) => {
      if (reminder.kind === 'note' && reminder.note) openNote(reminder.note.id);
      else setChanging(reminder);
    },
    canChangeWhen: (reminder: Reminder) =>
      reminder.kind === 'note' ||
      ((reminder.kind === 'due' || reminder.kind === 'renewal') && !!reminder.payment),
    changing,
    stopChanging: () => setChanging(null)
  };
};

export type RemindersPage = ReturnType<typeof useRemindersPage>;
