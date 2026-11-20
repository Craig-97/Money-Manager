import { PaymentHistoryQuery } from '~/graphql/generated';
import { daysBetween, formatLongMonthYear, fromApiDate, inDays } from '../dates';
import { formatMoney, roundPence } from '../format';
import { RecurringPayment } from './payments';
import { PER_YEAR } from './recurrence';
import { PER_PERIOD } from './renewal';

type HistoryRecord = NonNullable<PaymentHistoryQuery['recurringPayment']>['history'][number];

type HistoryKind = 'due' | 'paid' | 'skipped' | 'overpayment' | 'balance';

export interface HistoryEntry {
  id: string;
  kind: HistoryKind;
  date: Date;
  // "Paid", "Overpayment"
  label: string;
  // Beside the label: what changed since the one before, "Up from £18.00"
  note: string | null;
  // The line under it on mobile: "About £49 was interest", "From Everyday · up from £18.00"
  detail: string;
  // Money paid, or null for a skip, a balance set by hand, or a pay already in a payday balance
  amount: number | null;
  // The account it went out of or came into, once there's more than one to spend from
  account: string | null;
  // A debt's balance afterwards; for the next payment, an estimate
  balanceAfter: number | null;
  // An overpayment from this cycle, which can still be taken back
  undoable: boolean;
}

const LABELS: Record<HistoryKind, string> = {
  due: 'Due',
  paid: 'Paid',
  skipped: 'Skipped',
  overpayment: 'Overpayment',
  balance: 'Balance updated'
};

const KINDS: Record<HistoryRecord['kind'], HistoryKind> = {
  PAID: 'paid',
  SKIPPED: 'skipped',
  OVERPAYMENT: 'overpayment',
  BALANCE_SET: 'balance'
};

const interestText = (interest: number) =>
  interest > 0 ? `About ${formatMoney(interest, { whole: true })} was interest` : 'No interest';

/* Entries under a heading for each month, newest first: "October 2026" */
export const byMonth = <T extends { date: Date }>(entries: readonly T[]) => {
  const months: { label: string; entries: T[] }[] = [];
  for (const entry of entries) {
    const label = formatLongMonthYear(entry.date);
    const last = months.at(-1);
    if (last?.label === label) last.entries.push(entry);
    else months.push({ label, entries: [entry] });
  }
  return months;
};

/* "Due today", "Due tomorrow", "Due in 13 days" */
export const dueInText = (date: Date, today: Date) => {
  const days = daysBetween(today, date);
  if (days <= 0) return days === 0 ? 'Due today' : 'Overdue';
  return `Due ${inDays(days)}`;
};

// What one date of a pay cost: a pay covering several dates splits evenly
const perDate = (record: HistoryRecord) =>
  record.balanceChange ? Math.abs(record.balanceChange) / Math.max(1, record.dates.length) : null;

/*
 * "Up from £18.00" when a pay cost a different amount from the pay before it, so a price change
 * shows where it happened. The oldest in the list has nothing to compare with.
 */
const changeNote = (record: HistoryRecord, older: readonly HistoryRecord[]) => {
  const now = perDate(record);
  const before = older.find(other => other.kind === 'PAID' && perDate(other) !== null);
  const then = before ? perDate(before) : null;
  if (now === null || then === null || Math.abs(now - then) < 0.005) return null;
  return `${now > then ? 'Up' : 'Down'} from ${formatMoney(then)}`;
};

const recordEntry = (
  record: HistoryRecord,
  {
    payment,
    older,
    accountName
  }: {
    payment: RecurringPayment;
    // The records before it, newest first, for what changed since
    older: readonly HistoryRecord[];
    accountName: (id: string) => string | null;
  }
): HistoryEntry => {
  const kind = KINDS[record.kind];
  const balanceAfter = record.debt?.balanceAfter ?? null;
  const amount =
    kind === 'paid' || kind === 'overpayment' ? Math.abs(record.balanceChange) || null : null;
  const account = record.account && kind === 'paid' ? accountName(record.account) : null;
  const note = kind === 'paid' ? changeNote(record, older) : null;
  // A debt says what interest took; anything else, where it went and what changed
  const paidDetail = payment.debt
    ? interestText(record.debt?.interest ?? 0)
    : amount === null
      ? 'Counted in your payday balance'
      : [account && `From ${account}`, note && (account ? note.toLowerCase() : note)]
          .filter(Boolean)
          .join(' · ');
  const detail = {
    due: '',
    paid: paidDetail,
    skipped: 'Nothing paid this time',
    overpayment: 'All off the balance',
    balance: balanceAfter === null ? 'Set by hand' : `Set to ${formatMoney(balanceAfter)}`
  }[kind];
  return {
    id: record.id,
    kind,
    // A pay covers one or more due dates; the last is when it was settled up to
    date: fromApiDate(record.dates.at(-1) ?? record.createdAt)!,
    label: LABELS[kind],
    note,
    detail,
    amount,
    account,
    balanceAfter,
    undoable: kind === 'overpayment' && record.open
  };
};

/*
 * A recurring payment's history, newest first, led by the next one due when `next` says so. For a
 * debt the next one estimates what it'll leave: the period's interest goes on, then the payment
 * comes off, as the API works it out.
 */
export const paymentHistory = (
  payment: RecurringPayment,
  {
    records,
    today,
    next,
    accountName
  }: {
    records: readonly HistoryRecord[];
    today: Date;
    next: boolean;
    // An account's name for the From column; null when there's only one to spend from
    accountName: (id: string) => string | null;
  }
): HistoryEntry[] => {
  const entries = records.map((record, index) =>
    recordEntry(record, { payment, older: records.slice(index + 1), accountName })
  );
  const { debt, dueDate } = payment;
  if (!next || !dueDate || (debt && debt.balance <= 0)) return entries;

  const interest = debt
    ? roundPence((debt.balance * debt.apr) / 100 / PER_YEAR[payment.frequency])
    : 0;
  const due: HistoryEntry = {
    id: 'next',
    kind: 'due',
    date: dueDate,
    label: LABELS.due,
    note: null,
    detail: dueInText(dueDate, today),
    amount: payment.amount,
    account: payment.account ? accountName(payment.account) : null,
    balanceAfter: debt ? Math.max(0, roundPence(debt.balance + interest - payment.amount)) : null,
    undoable: false
  };
  return [due, ...entries];
};

/*
 * What a year of a payment came to, after its amount and how often: "a month · £150.00 paid in
 * 2026 · 1 skipped"
 */
export const historySummary = (
  payment: RecurringPayment,
  { entries, year }: { entries: readonly HistoryEntry[]; year: number }
) => {
  const paid = entries.filter(entry => entry.kind === 'paid');
  const total = roundPence(paid.reduce((sum, entry) => sum + (entry.amount ?? 0), 0));
  const skipped = entries.filter(entry => entry.kind === 'skipped').length;
  return [
    PER_PERIOD[payment.frequency],
    paid.length ? `${formatMoney(total)} paid in ${year}` : `nothing paid in ${year}`,
    skipped ? `${skipped} skipped` : null
  ]
    .filter(Boolean)
    .join(' · ');
};
