import { LeftOverOutcome } from '~/graphql/generated';
import { addDays } from '~/lib/dates';
import { payTowardsDebt } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import {
  formatShortDate,
  FREQUENCY_LABELS,
  nextOccurrence,
  occurrencesBetween,
  OneOffPayment,
  Payment,
  RecurringPayment
} from '~/lib/payments';

/*
 * The payday prompt's first step, "Check what's gone out", so nothing comes off the balance twice:
 * recurring payments left over from last cycle, each with what happened to it, and payments due
 * from payday to today, ticked if they've already gone out.
 */

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

// A recurring payment's dates from last cycle that were never paid or skipped
export interface LeftOver {
  payment: RecurringPayment;
  dates: Date[];
}

// A payment due from payday to today: a recurring one's dates in that time, or a one-off
export interface DueSince {
  key: string;
  payment: RecurringPayment | OneOffPayment;
  dates: Date[];
}

export const leftOverOf = (payments: readonly Payment[], cycle: PayCycle): LeftOver[] =>
  payments.flatMap(payment => {
    if (payment.kind !== 'recurring' || !payment.dueDate || payment.dueDate >= cycle.start) {
      return [];
    }
    const dates = occurrencesBetween(payment, {
      from: payment.dueDate,
      to: addDays(cycle.start, -1)
    });
    return dates.length ? [{ payment, dates }] : [];
  });

/*
 * Payments due from payday up to today. A recurring payment still waiting on last cycle's dates
 * only counts once those are dealt with, so one left still to pay isn't offered.
 */
export const dueSinceOf = (
  payments: readonly Payment[],
  { cycle, today, stillDue }: { cycle: PayCycle; today: Date; stillDue: ReadonlySet<string> }
): DueSince[] =>
  payments.flatMap((payment): DueSince[] => {
    if (!payment.dueDate || payment.dueDate > today) return [];
    if (payment.kind === 'oneOff') {
      return !payment.paidAt && payment.dueDate >= cycle.start
        ? [{ key: `oneOff:${payment.id}`, payment, dates: [payment.dueDate] }]
        : [];
    }
    if (stillDue.has(payment.id)) return [];
    const from = payment.dueDate < cycle.start ? cycle.start : payment.dueDate;
    const dates = occurrencesBetween(payment, { from, to: today });
    return dates.length ? [{ key: `recurring:${payment.id}`, payment, dates }] : [];
  });

/* What its dates add to the balance: negative for money out */
const signedTotal = ({ payment, dates }: { payment: Payment; dates: Date[] }) =>
  payment.signedAmount * dates.length;

/*
 * What the bank should show now: the balance as last confirmed, plus the income, less what has
 * gone out without being marked paid. Last cycle's payments count as gone out unless the user says
 * they didn't, and today's only once ticked.
 */
export const suggestedBalance = ({
  bankBalance,
  income,
  leftOver,
  outcomes,
  goneOut
}: {
  bankBalance: number;
  income: number;
  leftOver: readonly LeftOver[];
  outcomes: Readonly<Record<string, LeftOverOutcome>>;
  goneOut: readonly DueSince[];
}) => {
  const paidLeftOver = leftOver.filter(item => (outcomes[item.payment.id] ?? 'PAID') === 'PAID');
  const out = [...paidLeftOver, ...goneOut].reduce((total, item) => total + signedTotal(item), 0);
  return roundPence(bankBalance + income + out);
};

/*
 * The line under a left-over payment: only what else happens beyond the choice picked. Plain paid
 * has none; a debt says how much less is owed, its interest taken first, and a payment into savings
 * what it adds there.
 */
export const leftOverNote = (
  { payment, dates }: LeftOver,
  {
    outcome,
    cycle,
    today,
    intoName = null
  }: { outcome: LeftOverOutcome; cycle: PayCycle; today: Date; intoName?: string | null }
) => {
  if (outcome === 'DUE') return 'Stays due, shown as overdue';
  if (outcome === 'SKIPPED') {
    const next = nextOccurrence(payment, cycle.start);
    if (!next) return 'No more payments';
    return next.getTime() === today.getTime()
      ? 'Next due today'
      : `Next due ${formatShortDate(next, today)}`;
  }
  if (intoName) return `Adds ${formatMoney(payment.amount * dates.length)} to ${intoName}`;
  if (!payment.debt) return null;
  const paidOff = payTowardsDebt(payment.debt, {
    amount: payment.amount,
    frequency: payment.frequency,
    times: dates.length
  });
  return `${formatMoney(paidOff.reduction)} off what you owe, after ${formatMoney(paidOff.interest)} interest`;
};

/*
 * "Monthly · was due Mon 26 Oct", or "Weekly · 3 dates from Mon 5 Oct". With more than one account
 * to spend from it names the account instead: "From Everyday · was due Wed 21 Oct", and for a debt
 * "Debt · from Everyday · was due Thu 15 Oct".
 */
export const leftOverDetail = (
  { payment, dates }: LeftOver,
  { today, fromName = null }: { today: Date; fromName?: string | null }
) => {
  const kind = fromName
    ? payment.debt
      ? `Debt · from ${fromName}`
      : `From ${fromName}`
    : payment.debt
      ? 'Debt'
      : FREQUENCY_LABELS[payment.frequency];
  return dates.length === 1
    ? `${kind} · was due ${formatShortDate(dates[0], today)}`
    : `${kind} · ${dates.length} dates from ${formatShortDate(dates[0], today)}`;
};

/*
 * "Monthly · due today", "Into Cash ISA · due today", or "One-off · due Sat 31 Oct". With more
 * than one account to spend from it names the account: "From Everyday into Joint bills · due
 * today", "One-off · from Everyday · due Sat 31 Oct".
 */
export const dueSinceDetail = (
  { payment, dates }: DueSince,
  {
    today,
    intoName = null,
    fromName = null
  }: { today: Date; intoName?: string | null; fromName?: string | null }
) => {
  const from = fromName ? `From ${fromName}` : null;
  const kind = intoName
    ? from
      ? `${from} into ${intoName}`
      : `Into ${intoName}`
    : payment.kind === 'oneOff'
      ? from
        ? `One-off · from ${fromName}`
        : 'One-off'
      : (from ?? FREQUENCY_LABELS[payment.frequency]);
  const last = dates[dates.length - 1];
  const when =
    last.getTime() === today.getTime() ? 'due today' : `due ${formatShortDate(last, today)}`;
  return dates.length > 1 ? `${kind} · ${dates.length} dates, last ${when}` : `${kind} · ${when}`;
};

/*
 * The parts of the suggested balance, for the line under it: "£7,250.02 + £3,600.00 pay − £600.00
 * to Joint bills + £12.99 not gone out". It starts from the balance with last cycle's payments all
 * taken off, then adds back any that didn't go out, so the parts add up to the suggestion.
 */
export const balanceParts = ({
  bankBalance,
  leftOver,
  outcomes,
  goneOut,
  intoNameOf
}: {
  bankBalance: number;
  leftOver: readonly LeftOver[];
  outcomes: Readonly<Record<string, LeftOverOutcome>>;
  goneOut: readonly DueSince[];
  // Where a payment moves money to, if it does
  intoNameOf: (payment: Payment) => string | null;
}) => {
  const start = roundPence(
    leftOver.reduce((total, item) => total + signedTotal(item), bankBalance)
  );
  // Money out is negative here; each part is shown with its own sign
  const changes: { amount: number; label: string }[] = [];
  const addChange = (amount: number, label: string) => {
    const found = changes.find(change => change.label === label);
    if (found) found.amount = roundPence(found.amount + amount);
    else changes.push({ amount: roundPence(amount), label });
  };
  for (const item of goneOut) {
    const into = intoNameOf(item.payment);
    const amount = signedTotal(item);
    addChange(amount, into ? `to ${into}` : amount < 0 ? 'gone out' : 'paid in');
  }
  for (const item of leftOver) {
    if ((outcomes[item.payment.id] ?? 'PAID') === 'PAID') continue;
    const amount = -signedTotal(item);
    addChange(amount, amount > 0 ? 'not gone out' : 'not paid in');
  }
  return { start, changes: changes.filter(change => change.amount !== 0) };
};

/* "Netflix", "Netflix and Gym", "Netflix, Gym and Rent" */
export const listNames = (names: readonly string[]) =>
  new Intl.ListFormat('en-GB', { style: 'long', type: 'conjunction' }).format(names);
