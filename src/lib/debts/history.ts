import { DebtHistoryQuery } from '~/graphql/generated';
import { daysBetween, fromApiDate } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { PER_MONTH } from '~/lib/payments';
import { DebtPayment } from './debts';

type HistoryRecord = NonNullable<DebtHistoryQuery['recurringPayment']>['history'][number];

export type HistoryKind = 'due' | 'paid' | 'skipped' | 'overpayment' | 'balance';

export interface HistoryEntry {
  id: string;
  kind: HistoryKind;
  date: Date;
  // "Paid", "Overpayment"
  label: string;
  // The line under it on mobile: "About £49 was interest", "All off the balance"
  detail: string;
  // Money paid, or null for a skip or a balance set by hand
  amount: number | null;
  // What was left afterwards; for the next payment, an estimate
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

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

const interestText = (interest: number) =>
  interest > 0 ? `About ${formatMoney(interest, { whole: true })} was interest` : 'No interest';

const recordEntry = (record: HistoryRecord): HistoryEntry => {
  const kind = KINDS[record.kind];
  const balanceAfter = record.debt?.balanceAfter ?? null;
  const detail = {
    due: '',
    paid: interestText(record.debt?.interest ?? 0),
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
    detail,
    amount: kind === 'paid' || kind === 'overpayment' ? -record.balanceChange : null,
    balanceAfter,
    undoable: kind === 'overpayment' && record.open
  };
};

const MONTH = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' });

/* Entries under a heading for each month, newest first: "October 2026" */
export const byMonth = (entries: readonly HistoryEntry[]) => {
  const months: { label: string; entries: HistoryEntry[] }[] = [];
  for (const entry of entries) {
    const label = MONTH.format(entry.date);
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
  return days === 1 ? 'Due tomorrow' : `Due in ${days} days`;
};

/*
 * A debt's payments, newest first, led by the next one due with an estimate of what it'll leave:
 * the period's interest goes on, then the payment comes off, as the API works it out.
 */
export const debtHistory = (
  debt: DebtPayment,
  { records, today }: { records: readonly HistoryRecord[]; today: Date }
): HistoryEntry[] => {
  const entries = records.map(recordEntry);
  if (!debt.dueDate || debt.debt.balance <= 0) return entries;

  const periodsPerYear = 12 * PER_MONTH[debt.frequency];
  const interest = roundPence((debt.debt.balance * debt.debt.apr) / 100 / periodsPerYear);
  const next: HistoryEntry = {
    id: 'next',
    kind: 'due',
    date: debt.dueDate,
    label: LABELS.due,
    detail: dueInText(debt.dueDate, today),
    amount: debt.amount,
    balanceAfter: Math.max(0, roundPence(debt.debt.balance + interest - debt.amount)),
    undoable: false
  };
  return [next, ...entries];
};
