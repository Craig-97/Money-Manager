import { useAccount } from '~/hooks/useAccount';
import { usePayCycle } from '~/hooks/usePayCycle';
import { fromApiDate } from '~/lib/dates';
import { toNotes } from '~/lib/notes';
import { DEFAULT_REMINDER_SETTINGS, toPayments } from '~/lib/payments';
import {
  newReminders,
  ReminderSources,
  toReminderStates,
  upcomingReminders
} from '~/lib/reminders';

/*
 * The account's reminders: New, the ones that have gone off, and Coming up. Worked out from the
 * account each time, so they follow every change straight away. Empty until the account loads.
 */
export const useReminders = () => {
  const { account } = useAccount();
  const { today, cycle } = usePayCycle(account?.payday);
  const settings = account?.reminderSettings ?? DEFAULT_REMINDER_SETTINGS;
  const states = toReminderStates(account?.reminderStates);

  const sources: ReminderSources | null = account
    ? {
        payments: toPayments(account, today),
        notes: toNotes(account.notes),
        settings,
        cycle,
        cycleStartedOn: fromApiDate(account.cycleStartedOn),
        // Monthly pay is the one where the monthly income is what comes in on the day
        payAmount:
          (account.payday?.frequency ?? 'MONTHLY') === 'MONTHLY' ? account.monthlyIncome : null,
        states,
        today
      }
    : null;
  const fresh = sources ? newReminders(sources) : [];

  return {
    accountId: account?.id ?? null,
    today,
    settings,
    states,
    fresh,
    upcoming: sources ? upcomingReminders(sources) : [],
    // What the bell counts
    unread: fresh.filter(reminder => !reminder.read).length
  };
};

export type RemindersData = ReturnType<typeof useReminders>;
