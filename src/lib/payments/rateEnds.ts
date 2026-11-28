import { daysBetween, formatDayMonthYear, formatShortDay } from '../dates';
import { Payment, RecurringPayment } from './payments';
import {
  daysOptions,
  RATE_ENDS_REMINDER_DAYS,
  RATE_ENDS_USUAL_DAYS,
  reminderDays,
  TimingChoice
} from './reminderTiming';

/*
 * Rate ends: a debt's fixed or offer rate ending on a date, like a mortgage fix or a 0% card, while
 * its payments carry on. Its reminder is the payment's renewal reminder, as a debt has no renewal,
 * and its usual timing is 3 months before.
 */

export interface RateEnd {
  date: Date;
  // Days from today; negative once it has gone by
  days: number;
  // Within its reminder, so shown as coming up
  soon: boolean;
  // Gone by without the new rate end being set
  passed: boolean;
}

/* A payment's rate end, if it's a debt with one still being paid */
export const rateEndOf = (payment: RecurringPayment, today: Date): RateEnd | null => {
  const { debt } = payment;
  if (!debt?.rateEndsOn || debt.balance <= 0) return null;
  const days = daysBetween(today, debt.rateEndsOn);
  const before = reminderDays(payment.renewalReminder, RATE_ENDS_USUAL_DAYS);
  return {
    date: debt.rateEndsOn,
    days,
    passed: days < 0,
    soon: days >= 0 && before !== null && days <= before
  };
};

/* Close enough to show, or gone by without the new rate end being set */
export const isRateEndDue = (rateEnd: RateEnd) => rateEnd.soon || rateEnd.passed;

/* An alert's heading: "Mortgage rate ends on Mon 1 Mar", or "Mortgage rate has ended" */
export const rateEndHeading = (payment: Payment, rateEnd: RateEnd) =>
  rateEnd.passed
    ? `${payment.name} rate has ended`
    : `${payment.name} rate ends on ${formatShortDay(rateEnd.date)}`;

/* A debt row's rate, under its APR: "until 1 Mar 2027" */
export const rateUntilText = (date: Date) => `until ${formatDayMonthYear(date)}`;

/* A debt's view: "Fixed rate ends Mon 1 Mar 2027", or "ended" once it has */
export const rateEndsLine = (date: Date, today: Date) =>
  `Fixed rate ${daysBetween(today, date) < 0 ? 'ended' : 'ends'} ${formatShortDay(date, { withYear: true })}`;

/* A rate end's reminder as a choice: the usual timing is 3 months before */
export const toRateEndsChoice = (choice: TimingChoice): TimingChoice =>
  choice === 'usual' ? `${RATE_ENDS_USUAL_DAYS}` : choice;

/* The choices for a rate end's reminder: each number of days, then off. There's no usual one. */
export const rateEndsTimingOptions: { value: TimingChoice; label: string }[] = [
  ...daysOptions(RATE_ENDS_REMINDER_DAYS),
  { value: 'off', label: 'Off' }
];
