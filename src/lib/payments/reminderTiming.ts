/*
 * When a payment's reminders go off. Each payment has a timing for when it's due and one for when
 * it renews: off, a number of days before, or (no days) the budget's usual timing.
 */

export interface ReminderTiming {
  off: boolean;
  // Days before; null follows the usual timing
  days: number | null;
}

// When reminders go off for anything without its own timing
export interface ReminderSettings {
  // Days before a payment is due
  paymentDays: number;
  // Days before a renewal
  renewalDays: number;
  // Whether payday has a reminder
  payday: boolean;
}

export const USUAL_TIMING: ReminderTiming = { off: false, days: null };

// What a new budget starts with, and what's assumed before the budget has loaded
export const DEFAULT_REMINDER_SETTINGS: ReminderSettings = {
  paymentDays: 1,
  renewalDays: 30,
  payday: true
};

/* How many days before it goes off, or null when it's off */
export const reminderDays = (timing: ReminderTiming, usual: number) =>
  timing.off ? null : (timing.days ?? usual);

// The days before that each kind of reminder can be set to
export const PAYMENT_REMINDER_DAYS = [0, 1, 3, 7] as const;
export const RENEWAL_REMINDER_DAYS = [7, 14, 30] as const;

/* "On the day", "1 day before", "2 weeks before", "1 month before" */
export const daysBeforeText = (days: number) => {
  if (days === 0) return 'On the day';
  if (days === 30) return '1 month before';
  if (days % 7 === 0) return `${days / 7} ${days === 7 ? 'week' : 'weeks'} before`;
  return `${days} ${days === 1 ? 'day' : 'days'} before`;
};

/* "1 day before", or "Off" when it's off */
export const timingText = (days: number | null) => (days === null ? 'Off' : daysBeforeText(days));

// A timing as one value, for a picker: the usual timing, off, or a number of days as text
export type TimingChoice = 'usual' | 'off' | `${number}`;

export const toTimingChoice = (timing: ReminderTiming): TimingChoice =>
  timing.off ? 'off' : timing.days === null ? 'usual' : `${timing.days}`;

export const fromTimingChoice = (choice: TimingChoice): ReminderTiming =>
  choice === 'usual'
    ? USUAL_TIMING
    : choice === 'off'
      ? { off: true, days: null }
      : { off: false, days: Number(choice) };

/* The choices for a timing: the usual one (saying what it is), each number of days, then off */
export const timingOptions = ({
  days,
  usual
}: {
  days: readonly number[];
  usual: number;
}): { value: TimingChoice; label: string }[] => [
  { value: 'usual', label: `Usual · ${daysBeforeText(usual).toLowerCase()}` },
  ...days.map(day => ({ value: `${day}` as TimingChoice, label: daysBeforeText(day) })),
  { value: 'off', label: 'Off' }
];
