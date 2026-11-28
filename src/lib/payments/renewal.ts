import { PaymentFrequency } from '~/graphql/generated';
import { daysBetween, formatDayMonth, formatDayMonthYear, formatMonthYear, inDays } from '../dates';
import { capitalise } from '../format';
import { Payment, RecurringPayment } from './payments';

/*
 * Renewals: a policy or contract that renews on a date while its payments carry on, so it's worth
 * checking the price. Yearly payments renew with each payment, so their renewal is the next one.
 */

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
  BIANNUALLY: 'every 6 months',
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

/* "19 Jan", with the year when it isn't this year: "1 Mar 2027" */
export const dayMonthUnlessThisYear = (date: Date, today: Date) =>
  date.getFullYear() === today.getFullYear() ? formatDayMonth(date) : formatDayMonthYear(date);

/* For the Renewal column, whose heading says what it is: "In 22 days", "19 Jan", "Needs renewing" */
export const renewalDay = (renewal: Renewal, today: Date) => {
  if (renewal.passed) return 'Needs renewing';
  if (!renewal.soon) return dayMonthUnlessThisYear(renewal.date, today);
  return capitalise(inDays(renewal.days));
};

/* "Renews in 22 days", "Renews 19 Jan", "Needs renewing" */
export const renewalTag = (renewal: Renewal, today: Date) => {
  if (renewal.passed) return 'Needs renewing';
  const day = renewalDay(renewal, today);
  return `Renews ${day.charAt(0).toLowerCase()}${day.slice(1)}`;
};

/* An alert's heading: "Car insurance renews in 22 days", or "Breakdown cover has renewed" */
export const renewalHeading = (
  payment: Payment,
  { renewal, today }: { renewal: Renewal; today: Date }
) =>
  renewal.passed
    ? `${payment.name} has renewed`
    : `${payment.name} ${renewalTag(renewal, today).toLowerCase()}`;

/* How long until it renews, for the renewals list: "22 days", "17 weeks", "8 months", "2 years" */
export const renewalWhen = (renewal: Renewal) => {
  const { days } = renewal;
  if (renewal.passed) return 'Needs renewing';
  return timeUntil(days);
};

/* "Today", "Tomorrow", "22 days", "17 weeks", "8 months", "2 years" */
export const timeUntil = (days: number) => {
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 60) return `${days} days`;
  if (days < 182) return `${Math.round(days / 7)} weeks`;
  if (days < 730) return `${Math.round(days / 30.44)} months`;
  return `${Math.round(days / 365.25)} years`;
};

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

// How many renewals the window aims to hold
const SHOWN = 3;

/*
 * The shortest window that holds the soonest few renewals, so the list always reads sensibly: a
 * month when several are close, up to two years when they're spread out. Ones that need renewing
 * always come first and don't decide the window.
 */
export const renewalWindow = <T extends { next: Renewal }>(items: T[]): RenewalWindow<T> => {
  const sorted = items.toSorted((a, b) => a.next.date.getTime() - b.next.date.getTime());
  const passed = sorted.filter(item => item.next.passed);
  const coming = sorted.filter(item => !item.next.passed);
  if (coming.length === 0)
    return { shown: passed.slice(0, SHOWN), count: passed.length, label: '' };

  const target = coming[Math.min(SHOWN, coming.length) - 1].next.days;
  // The window holding the soonest few; failing that, one holding at least the next
  const window =
    WINDOWS.find(w => target <= w.days) ?? WINDOWS.find(w => coming[0].next.days <= w.days);
  if (!window) {
    return {
      shown: [...passed, coming[0]].slice(0, SHOWN),
      count: passed.length,
      label: `Next in ${formatMonthYear(coming[0].next.date)}`
    };
  }
  const inWindow = coming.filter(item => item.next.days <= window.days);
  return {
    shown: [...passed, ...inWindow].slice(0, SHOWN),
    count: passed.length + inWindow.length,
    label: window.label
  };
};

/* For a payment's category line while its renewal needs a look: "Renews in 22 days" */
/* Close enough to show, or gone by without the next date being set */
export const isRenewalDue = (renewal: Renewal) => renewal.soon || renewal.passed;

export const renewalNote = (payment: Payment, today: Date) => {
  if (payment.kind !== 'recurring') return null;
  const renewal = renewalOf(payment, today);
  return renewal && isRenewalDue(renewal) ? renewalTag(renewal, today) : null;
};
