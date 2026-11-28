import { LeftOverOutcome } from '~/graphql/generated';
import { Account, accountOf, isSpending, isStale, updatedText } from '~/lib/accounts';
import { addDays, formatShortDate, fromApiDate, PaydayConfig } from '~/lib/dates';
import { payTowardsDebt } from '~/lib/debts';
import { formatMoney, joinNames, roundPence } from '~/lib/format';
import { BankHolidays, countPaydays, PayCycle } from '~/lib/payday';
import {
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

// A recurring payment's dates from last cycle that were never paid or skipped
interface LeftOver {
  payment: RecurringPayment;
  dates: Date[];
}

// A payment due from payday to today: a recurring one's dates in that time, or a one-off
interface DueSince {
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

/*
 * Whether the latest payday's cycle still needs starting: it's after the last cycle was started.
 * Setup counts as a start, so a new budget waits for its first payday. That also catches a payday
 * missed over a weekend.
 */
export const needsNewCycle = (cycle: PayCycle, cycleStartedOn: string | null | undefined) => {
  const started = fromApiDate(cycleStartedOn);
  return !started || started < cycle.start;
};

/*
 * How many paydays the pay is from: every one since the last cycle was started, not just this one,
 * when the app wasn't opened for a while
 */
export const paydaysSince = (
  budget: { cycleStartedOn?: string | null; payday?: PaydayConfig | null },
  { cycle, holidays }: { cycle: PayCycle; holidays: BankHolidays }
) => {
  const started = fromApiDate(budget.cycleStartedOn);
  return started && budget.payday
    ? Math.max(1, countPaydays(budget.payday, { holidays, after: started, upTo: cycle.start }))
    : 1;
};

/* One-offs from last cycle never paid; ones due since payday are in "Check what's gone out" */
export const overdueOneOffs = (payments: readonly Payment[], cycle: PayCycle) =>
  payments.filter(
    payment =>
      payment.kind === 'oneOff' &&
      !payment.paidAt &&
      payment.dueDate &&
      payment.dueDate < cycle.start
  );

/* What ticked payments move into other accounts, for the line under step 1 */
export const movedInto = (
  goneOut: readonly DueSince[],
  intoNameOf: (payment: Payment) => string | null
) => {
  const totals = new Map<string, number>();
  for (const item of goneOut) {
    const into = intoNameOf(item.payment);
    if (into) {
      totals.set(
        into,
        roundPence((totals.get(into) ?? 0) + item.payment.amount * item.dates.length)
      );
    }
  }
  return [...totals].map(([name, amount]) => ({ name, amount }));
};

/*
 * From the payments recorded as paid: what's moved into each account, and what's gone out of each
 * one other than where pay lands, by account id
 */
export const accountMoves = (
  paid: readonly (LeftOver | DueSince)[],
  { accounts, paidIntoId }: { accounts: readonly Account[]; paidIntoId: string | undefined }
) => {
  const paidIn = new Map<string, number>();
  const paidOut = new Map<string, number>();
  const add = (map: Map<string, number>, { id, amount }: { id: string; amount: number }) =>
    map.set(id, roundPence((map.get(id) ?? 0) + amount));
  for (const item of paid) {
    const times = item.dates.length;
    const from = accountOf(item.payment, accounts);
    if (from && from.id !== paidIntoId)
      add(paidOut, { id: from.id, amount: -item.payment.signedAmount * times });
    if (item.payment.kind === 'recurring' && item.payment.paysInto) {
      add(paidIn, { id: item.payment.paysInto, amount: item.payment.amount * times });
    }
  }
  return { paidIn, paidOut };
};

/*
 * The line under another account to spend from in step 3: "After £440.02 of bills, with the
 * £600.00 top-up", or "After £440.02 of bills · updated 3 days ago"
 */
const spendingLine = ({ out, added, updated }: { out: number; added: number; updated: string }) => {
  const topUp = added ? `the ${formatMoney(added)} top-up` : null;
  if (!out) return topUp ? `With ${topUp}` : updated;
  const bills = `After ${formatMoney(out)} of bills`;
  return topUp ? `${bills}, with ${topUp}` : `${bills} · ${updated.toLowerCase()}`;
};

/*
 * The line under another account in step 3. A spending account says what bills have come off and
 * any top-up; savings what's paid in, interest added, and what's gone out. Amber only while it's
 * just how long ago the balance was updated.
 */
export const otherAccountLine = (
  account: Account,
  { added, out, today }: { added: number; out: number; today: Date }
) => {
  const updated = updatedText(account, today);
  const interest = account.interest?.added ?? [];
  const interestText = interest.length
    ? `Includes ${formatMoney(roundPence(interest.reduce((sum, item) => sum + item.amount, 0)))} interest added ${formatShortDate(interest.at(-1)!.date, today)}`
    : null;
  const text = isSpending(account)
    ? spendingLine({ out, added, updated })
    : [
        added ? `Includes ${formatMoney(added)} paid in` : null,
        interestText,
        out ? `${formatMoney(out)} gone out` : null
      ]
        .filter(Boolean)
        .join(' · ');
  return {
    text: text || updated,
    stale: (!text || text === updated) && isStale(account, today)
  };
};

// "Netflix and Rent were recorded as paid."
const recordedText = (names: readonly string[], what: string) =>
  names.length ? `${joinNames(names)} ${names.length === 1 ? 'was' : 'were'} ${what}.` : '';

/*
 * What starting the cycle did, for the summary: "Netflix was recorded as paid. £600.00 added to
 * Cash ISA. Joint bills was updated."
 */
export const startedText = ({
  paid,
  skipped,
  moved,
  updated
}: {
  paid: readonly string[];
  skipped: readonly string[];
  // Money moved into accounts whose balance wasn't typed over
  moved: readonly { amount: number; name: string; spending: boolean }[];
  // Accounts whose balance was
  updated: readonly string[];
}) =>
  [
    recordedText(paid, 'recorded as paid'),
    recordedText(skipped, 'recorded as skipped'),
    ...moved.map(
      ({ amount, name, spending }) =>
        `${formatMoney(amount)} ${spending ? 'moved' : 'added'} to ${name}.`
    ),
    recordedText(updated, 'updated')
  ]
    .filter(Boolean)
    .join(' ');
