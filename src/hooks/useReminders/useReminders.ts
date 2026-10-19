import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { fromApiDate } from '~/lib/dates';
import { followPayments, toNotes } from '~/lib/notes';
import { DEFAULT_REMINDER_SETTINGS, toPayments } from '~/lib/payments';
import {
  newReminders,
  ReminderSources,
  toReminderStates,
  upcomingReminders
} from '~/lib/reminders';

/*
 * The budget's reminders: New, the ones that have gone off, and Coming up. Worked out from the
 * budget each time, so they follow every change straight away. Empty until the budget loads.
 */
export const useReminders = () => {
  const { budget } = useBudget();
  const { today, cycle } = usePayCycle(budget?.payday);
  const settings = budget?.reminderSettings ?? DEFAULT_REMINDER_SETTINGS;
  const states = toReminderStates(budget?.reminderStates);

  const payments = budget ? toPayments(budget, today) : [];
  const sources: ReminderSources | null = budget
    ? {
        payments,
        // Notes that follow a payment take its next date
        notes: followPayments(toNotes(budget.notes), payments),
        settings,
        cycle,
        cycleStartedOn: fromApiDate(budget.cycleStartedOn),
        // Monthly pay is the one where the monthly income is what comes in on the day
        payAmount:
          (budget.payday?.frequency ?? 'MONTHLY') === 'MONTHLY' ? budget.monthlyIncome : null,
        states,
        today
      }
    : null;
  const fresh = sources ? newReminders(sources) : [];

  return {
    budgetId: budget?.id ?? null,
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
