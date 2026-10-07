import { daysBetween } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { formatShortDate, isInCycle, Payment, Summary, summarise } from '~/lib/payments';

export type PaymentTab = 'upcoming' | 'recurring' | 'oneOff';

export type DueState = 'today' | 'overdue' | 'later' | 'ended';

export interface DueInfo {
  state: DueState;
  // Days from today, negative when overdue; null once a recurring payment has ended
  days: number | null;
  // "Today", "Fri 9 Oct" or "Ended"
  label: string;
  // "In 7 days", "Tomorrow", "After payday"
  detail: string;
}

export const dueInfo = (payment: Payment, today: Date, cycle: PayCycle): DueInfo => {
  if (!payment.dueDate)
    return { state: 'ended', days: null, label: 'Ended', detail: 'No upcoming date' };
  const days = daysBetween(today, payment.dueDate);
  const label = days === 0 ? 'Today' : formatShortDate(payment.dueDate, today);
  if (days === 0) return { state: 'today', days, label, detail: 'Today' };
  if (days < 0) return { state: 'overdue', days, label, detail: 'Overdue' };
  const detail =
    payment.dueDate >= cycle.end ? 'After payday' : days === 1 ? 'Tomorrow' : `In ${days} days`;
  return { state: 'later', days, label, detail };
};

export const TABS: { value: PaymentTab; label: string }[] = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'recurring', label: 'Recurring' },
  { value: 'oneOff', label: 'One-off' }
];

/* The payments a tab lists, by due date */
export const paymentsForTab = (
  payments: Payment[],
  tab: PaymentTab,
  cycle: PayCycle,
  today: Date,
  ascending: boolean
) => {
  const listed = payments.filter(payment =>
    tab === 'upcoming'
      ? isInCycle(payment, cycle)
      : tab === 'recurring'
        ? payment.kind === 'recurring'
        : payment.kind === 'oneOff'
  );
  // Ended payments go last either way
  const sortKey = (payment: Payment) => dueInfo(payment, today, cycle).days ?? Infinity;
  return listed.sort((a, b) => {
    const [x, y] = [sortKey(a), sortKey(b)];
    if (x === Infinity || y === Infinity) return x === y ? 0 : x === Infinity ? 1 : -1;
    return ascending ? x - y : y - x;
  });
};
/* What the cycle bar's tooltip says about a day */
export const dayTitle = (date: Date, tags: string[]) =>
  formatShortDate(date) + (tags.length ? ` · ${tags.join(' · ')}` : '');

interface OverridePreviewInput {
  payments: Payment[];
  bankBalance: number;
  monthlyIncome: number;
  cycle: PayCycle;
  today: Date;
  // The date the next payday would move to
  picked: Date;
}

/* What moving the next payday to another date does to the cycle, against how it stands */
export const overridePreview = ({ picked, ...input }: OverridePreviewInput) => {
  const before = summarise(input);
  const after = summarise({ ...input, cycle: { ...input.cycle, end: picked } });
  const names = (from: Summary, without: Summary) =>
    from.inCycle
      .filter(payment => !without.inCycle.some(other => other.id === payment.id))
      .map(payment => payment.name);

  return {
    daysBefore: before.daysToPayday,
    daysAfter: after.daysToPayday,
    freeBefore: before.freeToSpend,
    freeAfter: after.freeToSpend,
    // Payments that fall after the new payday, and ones that now fall before it
    leaving: names(before, after),
    joining: names(after, before)
  };
};

export type OverridePreview = ReturnType<typeof overridePreview>;
