import { daysBetween, PaydayConfig } from '~/lib/dates';
import { PayCycle, WEEKDAYS } from '~/lib/payday';
import { formatShortDate, isInCycle, Payment } from '~/lib/payments';

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

const PAY_FREQUENCY: Record<PaydayConfig['frequency'], string> = {
  WEEKLY: 'Weekly',
  FORTNIGHTLY: 'Fortnightly',
  FOUR_WEEKLY: 'Four-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUAL: 'Every 6 months',
  ANNUAL: 'Yearly'
};

const paydayRule = ({ type, weekday }: PaydayConfig) => {
  const day = WEEKDAYS.find(item => item.value === weekday)?.long;
  switch (type) {
    case 'LAST_DAY':
      return 'last working day';
    case 'LAST_WEEKDAY':
      return `last ${day ?? 'Friday'}`;
    case 'SET_DAY':
      return 'set day';
    case 'SET_WEEKDAY':
      return 'set weekday';
  }
};

const REGION: Record<string, string> = {
  ENGLAND_AND_WALES: 'England & Wales',
  SCOTLAND: 'Scotland',
  NORTHERN_IRELAND: 'Northern Ireland'
};

/* "Monthly · last Friday · Scotland bank holidays" */
export const paydayText = (payday: PaydayConfig | null | undefined) => {
  if (!payday) return 'Monthly · last working day';
  const parts = [PAY_FREQUENCY[payday.frequency], paydayRule(payday)];
  if (payday.bankHolidayRegion) parts.push(`${REGION[payday.bankHolidayRegion]} bank holidays`);
  return parts.join(' · ');
};

/* "Paid monthly · last Friday" */
export const paidText = (payday: PaydayConfig | null | undefined) =>
  payday
    ? `Paid ${PAY_FREQUENCY[payday.frequency].toLowerCase()} · ${paydayRule(payday)}`
    : 'Paid monthly · last working day';

/* What the cycle bar's tooltip says about a day */
export const dayTitle = (date: Date, tags: string[]) =>
  formatShortDate(date) + (tags.length ? ` · ${tags.join(' · ')}` : '');
