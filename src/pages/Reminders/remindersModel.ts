import { formatLongMonth } from '~/lib/dates';
import { Reminder, ReminderFilter } from '~/lib/reminders';

export type RemindersTab = 'new' | 'up';

export const FILTERS: { value: ReminderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'payments', label: 'Payments' },
  { value: 'renewals', label: 'Renewals' },
  { value: 'notes', label: 'Notes' }
];

interface ReminderGroup {
  label: string;
  reminders: Reminder[];
}

// In a later year, so grouped by year rather than month
const isFar = (date: Date, today: Date) => date.getFullYear() > today.getFullYear();

/* Coming up in groups: a month at a time this year, then a year at a time */
export const groupByMonth = (reminders: readonly Reminder[], today: Date): ReminderGroup[] => {
  const groups: ReminderGroup[] = [];
  for (const reminder of reminders) {
    const { date } = reminder;
    const label = isFar(date, today) ? String(date.getFullYear()) : formatLongMonth(date);
    const last = groups.at(-1);
    if (last?.label === label) last.reminders.push(reminder);
    else groups.push({ label, reminders: [reminder] });
  }
  return groups;
};

/* What the date box shows over the day: the weekday, or the month once it's grouped by year */
export const dateBoxTop = (date: Date, today: Date) => (isFar(date, today) ? 'month' : 'weekday');
