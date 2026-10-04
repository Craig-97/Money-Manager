import { PaymentFrequency } from '~/graphql/generated';
import { addDays } from '~/lib/dates';

// The same schedule maths as the API (utils/dates/recurrence.ts), on local dates

const MONTHS_BETWEEN: Partial<Record<PaymentFrequency, number>> = {
  MONTHLY: 1,
  QUARTERLY: 3,
  ANNUALLY: 12
};

const DAYS_BETWEEN: Partial<Record<PaymentFrequency, number>> = {
  WEEKLY: 7,
  BIWEEKLY: 14
};

// Enough to cover a weekly payment for well over a century
const MAX_OCCURRENCES = 10_000;

export interface Schedule {
  firstPaymentDate: Date;
  frequency: PaymentFrequency;
  lastPaymentDate?: Date | null;
}

/*
 * The kth date a payment falls on, counting the first as 0. Month-based payments keep the first
 * date's day, moving to the end of shorter months: the 31st falls on 28 Feb, then 31 Mar.
 */
export const occurrence = (first: Date, frequency: PaymentFrequency, k: number) => {
  const days = DAYS_BETWEEN[frequency];
  if (days) return addDays(first, days * k);

  const month = first.getMonth() + (MONTHS_BETWEEN[frequency] ?? 1) * k;
  const lastDay = new Date(first.getFullYear(), month + 1, 0).getDate();
  return new Date(first.getFullYear(), month, Math.min(first.getDate(), lastDay));
};

/* Every date the payment falls on from `from` to `to`, inclusive */
export const occurrencesBetween = (
  { firstPaymentDate, frequency, lastPaymentDate }: Schedule,
  from: Date,
  to: Date
) => {
  const dates: Date[] = [];
  for (let k = 0; k < MAX_OCCURRENCES; k++) {
    const date = occurrence(firstPaymentDate, frequency, k);
    if (date > to || (lastPaymentDate && date > lastPaymentDate)) break;
    if (date >= from) dates.push(date);
  }
  return dates;
};

/* The first date the payment falls on that is on or after `from`, or null once it has ended */
export const nextOccurrence = (schedule: Schedule, from: Date) => {
  for (let k = 0; k < MAX_OCCURRENCES; k++) {
    const date = occurrence(schedule.firstPaymentDate, schedule.frequency, k);
    if (schedule.lastPaymentDate && date > schedule.lastPaymentDate) return null;
    if (date >= from) return date;
  }
  return null;
};

// How many times a month a payment goes out on average, for the monthly totals
export const PER_MONTH: Record<PaymentFrequency, number> = {
  WEEKLY: 52 / 12,
  BIWEEKLY: 26 / 12,
  MONTHLY: 1,
  QUARTERLY: 1 / 3,
  ANNUALLY: 1 / 12
};
