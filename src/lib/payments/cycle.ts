import { addDays } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { formatShortDate } from './labels';
import { Outcome, Payment, RecurringPayment } from './payments';
import { occurrencesBetween } from './recurrence';

/*
 * The dates a payment is still to pay before payday, overdue ones included. A recurring payment
 * can fall more than once in a cycle (a weekly one, say), and each date counts.
 */
export const datesDue = (payment: Payment, cycle: PayCycle): Date[] => {
  const { dueDate } = payment;
  if (!dueDate || dueDate >= cycle.end) return [];
  if (payment.kind === 'oneOff') return [dueDate];
  return [dueDate, ...occurrencesBetween(payment, addDays(dueDate, 1), addDays(cycle.end, -1))];
};

/* Whether a payment still has something to pay before payday. Paid one-offs are deleted. */
export const isInCycle = (payment: Payment, cycle: PayCycle) => datesDue(payment, cycle).length > 0;

/*
 * Dates this cycle before a payment's next date that weren't paid or skipped here. A payment added
 * partway through a cycle starts from its next date, so its earlier ones have already gone out.
 */
const datesBeforeAdded = (payment: RecurringPayment, cycle: PayCycle) => {
  const { dueDate } = payment;
  if (!dueDate) return 0;
  const recorded = new Set(
    payment.handled.flatMap(entry => entry.dates).map(date => date.getTime())
  );
  const until = addDays(dueDate < cycle.end ? dueDate : cycle.end, -1);
  return occurrencesBetween(payment, cycle.start, until).filter(
    date => !recorded.has(date.getTime())
  ).length;
};

/*
 * How many of a recurring payment's dates this cycle are paid, skipped, or still to pay. Dates
 * from before it was added count as paid, though there's nothing of them to undo.
 */
const cycleCounts = (payment: RecurringPayment, cycle: PayCycle) => {
  const count = (outcome: Outcome) =>
    payment.handled
      .filter(entry => entry.outcome === outcome)
      .flatMap(entry => entry.dates)
      .filter(date => date >= cycle.start).length;
  return {
    paid: count('paid') + datesBeforeAdded(payment, cycle),
    skipped: count('skipped'),
    left: datesDue(payment, cycle).length
  };
};

type CycleTone = 'unpaid' | 'paid' | 'skipped' | 'ended';

/*
 * Where a recurring payment stands this cycle: "Unpaid", "1 of 4 paid", "Paid", "Skipped"... or
 * "Not due yet" when none of its dates fall in this one.
 */
export const cycleStatus = (
  payment: RecurringPayment,
  cycle: PayCycle
): { tone: CycleTone; label: string } => {
  const { paid, skipped, left } = cycleCounts(payment, cycle);
  if (left > 0) {
    if (!skipped) {
      return { tone: 'unpaid', label: paid ? `${paid} of ${paid + left} paid` : 'Unpaid' };
    }
    const parts = [paid ? `${paid} paid` : '', `${skipped} skipped`, `${left} left`];
    return { tone: 'unpaid', label: parts.filter(Boolean).join(' · ') };
  }
  if (paid && skipped) return { tone: 'paid', label: 'Done' };
  if (paid) return { tone: 'paid', label: 'Paid' };
  if (skipped) return { tone: 'skipped', label: 'Skipped' };
  return payment.dueDate
    ? { tone: 'unpaid', label: 'Not due yet' }
    : { tone: 'ended', label: 'Ended' };
};

/*
 * Whether paying makes sense: there's something to pay before payday, or nothing has been dealt
 * with this cycle yet and its next date is after payday (paying ahead). Once a cycle's dates are
 * all dealt with, the next one waits for the next cycle.
 */
export const canPay = (payment: Payment, cycle: PayCycle) => {
  if (payment.kind === 'oneOff') return true;
  if (!payment.dueDate) return false;
  const { paid, skipped, left } = cycleCounts(payment, cycle);
  return left > 0 || paid + skipped === 0;
};

// Weekly and fortnightly payments can fall more than once a cycle, so their actions name the date
export const repeatsInCycle = (payment: RecurringPayment) =>
  payment.frequency === 'WEEKLY' || payment.frequency === 'BIWEEKLY';

interface PaymentChoices {
  // Each is the action's label, or null when it isn't offered
  pay: string | null;
  // Undoes the latest pay or skip
  undo: string | null;
  skipNext: string | null;
  // Skips every date left before payday
  skipRest: string | null;
}

/* What can be done with a payment now, labelled as the menu and payment dialog show it */
export const paymentChoices = (payment: Payment, cycle: PayCycle, today: Date): PaymentChoices => {
  const day = (date: Date) => formatShortDate(date, today);
  if (payment.kind === 'oneOff') {
    return { pay: 'Mark as paid', undo: null, skipNext: null, skipRest: null };
  }

  const repeats = repeatsInCycle(payment);
  const next = payment.dueDate;
  const { left } = cycleCounts(payment, cycle);
  const latest = payment.handled.at(-1);

  const pay = canPay(payment, cycle)
    ? repeats
      ? `Mark ${day(next!)} as paid`
      : 'Mark as paid'
    : null;
  let undo: string | null = null;
  if (latest?.outcome === 'paid') {
    undo = repeats ? `Mark ${day(latest.dates[0])} as unpaid` : 'Mark as unpaid';
  } else if (latest) {
    undo =
      latest.dates.length > 1
        ? `Undo skipping ${latest.dates.length} dates`
        : repeats
          ? `Undo skipping ${day(latest.dates[0])}`
          : 'Undo skip';
  }
  return {
    pay,
    undo,
    skipNext: left === 0 ? null : left === 1 ? 'Skip this cycle' : `Skip ${day(next!)}`,
    skipRest: left > 1 ? `Skip the rest of this cycle (${left})` : null
  };
};
