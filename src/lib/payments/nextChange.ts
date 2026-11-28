import { daysBetween, formatDayMonthYear, formatShortDate, inDays } from '../dates';
import { RecurringPayment } from './payments';
import { RateEnd, rateEndOf } from './rateEnds';
import { DEFAULT_REMINDER_SETTINGS } from './reminderTiming';
import {
  PER_PERIOD,
  Renewal,
  dayMonthUnlessThisYear,
  renewalDay,
  renewalOf,
  renewalTag,
  renewalWhen,
  timeUntil
} from './renewal';

/*
 * What happens next to a recurring payment, for the Renews or ends column and its tags: a renewal,
 * a rate ending on a debt, or a last payment after which it stops. Each has a date and when it's
 * coming up, as a renewal does.
 */

export type NextChangeKind = 'renews' | 'rateEnds' | 'stops';

export interface NextChange {
  kind: NextChangeKind;
  date: Date;
  // Days from today; negative once it has gone by
  days: number;
  // Within its reminder, so shown as coming up
  soon: boolean;
  // Gone by without the next renewal or rate end being set. A stop never is: it has ended instead.
  passed: boolean;
}

/* A renewal or a rate end, the two the Renewals list and tile are about */
export type RenewalChange = NextChange & { kind: 'renews' | 'rateEnds' };

const fromRenewal = (renewal: Renewal): RenewalChange => ({ kind: 'renews', ...renewal });
const fromRateEnd = (rateEnd: RateEnd): RenewalChange => ({ kind: 'rateEnds', ...rateEnd });

/* A payment's renewal, or its debt's rate end, while it's still running */
export const renewalChangeOf = (payment: RecurringPayment, today: Date): RenewalChange | null => {
  const renewal = renewalOf(payment, today);
  if (renewal) return fromRenewal(renewal);
  const rateEnd = rateEndOf(payment, today);
  return rateEnd ? fromRateEnd(rateEnd) : null;
};

/*
 * Its last payment, while it's still to come. It's "coming up" inside the payment's renewal
 * reminder, or the budget's usual renewal timing when that's off, as it's only a tag.
 */
const stopOf = (payment: RecurringPayment, today: Date): NextChange | null => {
  if (!payment.dueDate || !payment.lastPaymentDate) return null;
  const days = daysBetween(today, payment.lastPaymentDate);
  if (days < 0) return null;
  const before = payment.renewalReminderDays || DEFAULT_REMINDER_SETTINGS.renewalDays;
  return {
    kind: 'stops',
    date: payment.lastPaymentDate,
    days,
    soon: days <= before,
    passed: false
  };
};

/* What happens next, whichever of the three comes first */
export const nextChangeOf = (payment: RecurringPayment, today: Date): NextChange | null => {
  const renewal = renewalChangeOf(payment, today);
  const stop = stopOf(payment, today);
  return renewal && stop ? (stop.date < renewal.date ? stop : renewal) : (renewal ?? stop);
};

export type NextChangeForm = 'long' | 'short' | 'when';

// "in 5 days", "today", "tomorrow"
const inText = (days: number) => (days <= 1 ? inDays(days) : `in ${timeUntil(days)}`);

/*
 * Its tag: long reads "Renews 19 Jan", "Ends 1 Mar", "Last one in 5 days", "Rate ends 1 Mar 2027".
 * Short is for the column, whose heading says the rest for a renewal ("19 Jan", "In 22 days"), and
 * drops the year of a rate end that's this year. When is how long until, for the Renewals list.
 */
export const nextChangeText = (
  next: NextChange,
  { today, form }: { today: Date; form: NextChangeForm }
) => {
  if (next.kind === 'renews') {
    const renewal: Renewal = next;
    return form === 'long'
      ? renewalTag(renewal, today)
      : form === 'short'
        ? renewalDay(renewal, today)
        : renewalWhen(renewal);
  }
  if (next.kind === 'stops') {
    if (next.soon) return `Last one ${inText(next.days)}`;
    return form === 'when'
      ? `Ends ${inText(next.days)}`
      : `Ends ${dayMonthUnlessThisYear(next.date, today)}`;
  }
  if (next.passed) return 'Rate ended';
  if (form === 'when' || next.soon) return `Rate ends ${inText(next.days)}`;
  return `Rate ends ${form === 'long' ? formatDayMonthYear(next.date) : dayMonthUnlessThisYear(next.date, today)}`;
};

/* "Fri 2 Oct · £612.00 a year", or "Renewed Mon 28 Sep · …" / "Rate ended Mon 1 Mar · …" once gone by */
export const nextChangeLine = (
  payment: RecurringPayment,
  { next, today, money }: { next: NextChange; today: Date; money: string }
) => {
  const gone = !next.passed ? '' : next.kind === 'rateEnds' ? 'Rate ended ' : 'Renewed ';
  return `${gone}${formatShortDate(next.date, today)} · ${money} ${PER_PERIOD[payment.frequency]}`;
};
