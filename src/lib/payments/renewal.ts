import { PaymentFrequency } from '~/graphql/generated';
import { daysBetween, formatDayMonth } from '~/lib/dates';
import { formatShortDate } from './labels';
import { Payment, RecurringPayment } from './payments';

/*
 * Renewals: a policy or contract that renews on a date while its payments carry on, so it's worth
 * checking the price. Yearly payments renew with each payment, so their renewal is the next one.
 */

// How many days before a renewal it shows as coming up. 0 is no reminder.
export const REMINDER_DAYS = [0, 7, 14, 30] as const;
export type ReminderDays = (typeof REMINDER_DAYS)[number];

export const REMINDER_LABELS: Record<ReminderDays, string> = {
  0: 'Off',
  7: '1 week',
  14: '2 weeks',
  30: '1 month'
};

// A new renewal reminds a month ahead; yearly payments have no reminder until one is chosen
export const DEFAULT_REMINDER: ReminderDays = 30;

export const toReminderDays = (days: number): ReminderDays =>
  (REMINDER_DAYS as readonly number[]).includes(days) ? (days as ReminderDays) : DEFAULT_REMINDER;

/* The same day a year on, moving 29 Feb to 28 Feb */
export const addYear = (date: Date) => {
  const next = new Date(date.getFullYear() + 1, date.getMonth(), date.getDate());
  return next.getMonth() === date.getMonth()
    ? next
    : new Date(date.getFullYear() + 1, date.getMonth() + 1, 0);
};

// "£7.50 a month": how often an amount goes out, after it
export const PER_PERIOD: Record<PaymentFrequency, string> = {
  WEEKLY: 'a week',
  BIWEEKLY: 'a fortnight',
  MONTHLY: 'a month',
  QUARTERLY: 'a quarter',
  ANNUALLY: 'a year'
};

export interface Renewal {
  date: Date;
  // Days from today; negative once it has gone by
  days: number;
  // Within its reminder, so shown as coming up
  soon: boolean;
  // Gone by without the next renewal being set
  passed: boolean;
}

/* A payment's renewal, if it has one and is still running */
export const renewalOf = (payment: RecurringPayment, today: Date): Renewal | null => {
  if (!payment.dueDate) return null;
  const yearly = payment.frequency === 'ANNUALLY';
  // A yearly payment that keeps going renews with each payment. The reminder only decides when it
  // shows as coming up, not whether it renews.
  const date = yearly ? (payment.lastPaymentDate ? null : payment.dueDate) : payment.renewalDate;
  if (!date) return null;

  const days = daysBetween(today, date);
  const passed = days < 0 && !yearly;
  return {
    date,
    days,
    passed,
    soon: !passed && payment.renewalReminderDays > 0 && days <= payment.renewalReminderDays
  };
};

/* "Renews in 22 days", "Renews 19 Jan", "Needs renewing" */
export const renewalTag = (renewal: Renewal, today: Date) => {
  if (renewal.passed) return 'Needs renewing';
  if (!renewal.soon) {
    const year =
      renewal.date.getFullYear() === today.getFullYear() ? '' : ` ${renewal.date.getFullYear()}`;
    return `Renews ${formatDayMonth(renewal.date)}${year}`;
  }
  if (renewal.days === 0) return 'Renews today';
  if (renewal.days === 1) return 'Renews tomorrow';
  return `Renews in ${renewal.days} days`;
};

/* An alert's heading: "Car insurance renews in 22 days", or "Breakdown cover has renewed" */
export const renewalHeading = (payment: Payment, renewal: Renewal, today: Date) =>
  renewal.passed
    ? `${payment.name} has renewed`
    : `${payment.name} ${renewalTag(renewal, today).toLowerCase()}`;

/* How long until it renews, for the renewals list: "22 days", "17 weeks", "8 months", "2 years" */
export const renewalWhen = (renewal: Renewal) => {
  const { days } = renewal;
  if (renewal.passed) return 'Needs renewing';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 60) return `${days} days`;
  if (days < 182) return `${Math.round(days / 7)} weeks`;
  if (days < 730) return `${Math.round(days / 30.44)} months`;
  return `${Math.round(days / 365.25)} years`;
};

/* "Fri 2 Oct · £612.00 a year", or "Renewed Mon 28 Sep · …" once it has gone by */
export const renewalLine = (
  payment: RecurringPayment,
  renewal: Renewal,
  today: Date,
  money: string
) =>
  `${renewal.passed ? 'Renewed ' : ''}${formatShortDate(renewal.date, today)} · ${money} ${PER_PERIOD[payment.frequency]}`;

// The windows the renewals list can cover, shortest first
const WINDOWS = [
  { days: 31, label: 'Next month' },
  { days: 92, label: 'Next 3 months' },
  { days: 183, label: 'Next 6 months' },
  { days: 366, label: 'Next year' },
  { days: 731, label: 'Next 2 years' }
];

interface RenewalWindow<T> {
  // What the list shows: any that need renewing, then the ones in the window
  shown: T[];
  // Any that need renewing plus the ones in the window, for the summary's count
  count: number;
  // "Next 6 months", or when even the soonest is further off, "Next in Mar 2029"
  label: string;
}

const MONTH_YEAR = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

/*
 * The shortest window that holds the soonest few renewals, so the list always reads sensibly: a
 * month when several are close, up to two years when they're spread out. Ones that need renewing
 * always come first and don't decide the window.
 */
export const renewalWindow = <T extends { renewal: Renewal }>(
  items: T[],
  today: Date,
  size = 3
): RenewalWindow<T> => {
  const sorted = items.toSorted((a, b) => a.renewal.date.getTime() - b.renewal.date.getTime());
  const passed = sorted.filter(item => item.renewal.passed);
  const coming = sorted.filter(item => !item.renewal.passed);
  if (coming.length === 0) return { shown: passed.slice(0, size), count: passed.length, label: '' };

  const target = coming[Math.min(size, coming.length) - 1].renewal.days;
  // The window holding the soonest few; failing that, one holding at least the next
  const window =
    WINDOWS.find(w => target <= w.days) ?? WINDOWS.find(w => coming[0].renewal.days <= w.days);
  if (!window) {
    return {
      shown: [...passed, coming[0]].slice(0, size),
      count: passed.length,
      label: `Next in ${MONTH_YEAR.format(coming[0].renewal.date)}`
    };
  }
  const inWindow = coming.filter(item => item.renewal.days <= window.days);
  return {
    shown: [...passed, ...inWindow].slice(0, size),
    count: passed.length + inWindow.length,
    label: window.label
  };
};

/* For a payment's category line while its renewal needs a look: "Renews in 22 days" */
export const renewalNote = (payment: Payment, today: Date) => {
  if (payment.kind !== 'recurring') return null;
  const renewal = renewalOf(payment, today);
  return renewal && (renewal.soon || renewal.passed) ? renewalTag(renewal, today) : null;
};
