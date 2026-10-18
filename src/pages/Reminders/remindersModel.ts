import { Reminder, ReminderFilter } from '~/lib/reminders';

export type RemindersTab = 'new' | 'up';

export const FILTERS: { value: ReminderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'payments', label: 'Payments' },
  { value: 'renewals', label: 'Renewals' },
  { value: 'notes', label: 'Notes' }
];

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];
const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface ReminderGroup {
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
    const label = isFar(date, today) ? String(date.getFullYear()) : MONTHS[date.getMonth()];
    const last = groups.at(-1);
    if (last?.label === label) last.reminders.push(reminder);
    else groups.push({ label, reminders: [reminder] });
  }
  return groups;
};

/* The date box's two lines: the weekday over the day, or the month once it's grouped by year */
export const dateBox = (date: Date, today: Date) => ({
  top: (isFar(date, today)
    ? SHORT_MONTHS[date.getMonth()]
    : SHORT_DAYS[date.getDay()]
  ).toUpperCase(),
  day: date.getDate()
});

/* "5 reminders" */
export const countText = (count: number) => `${count} ${count === 1 ? 'reminder' : 'reminders'}`;
