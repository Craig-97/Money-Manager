import { daysBetween, formatShortDate, formatShortWeekday, inDays } from '../dates';
import { capitalise } from '../format';
import { PayCycle } from '../payday';
import { movedHow, nonWorkingReason } from './nonWorkingDay';
import { Payment } from './payments';

type DueState = 'today' | 'overdue' | 'later' | 'ended' | 'paid';

export interface DueInfo {
  state: DueState;
  // Days from today, negative when overdue; null once a recurring payment has ended
  days: number | null;
  // "Today", "Fri 9 Oct" or "Ended"
  label: string;
  // "In 7 days", "Tomorrow", "After payday", "Paid"
  detail: string;
  // When the date was moved off a weekend or bank holiday
  moved: MovedDate | null;
}

export interface MovedDate {
  // "Moved from Sat 24 Oct"
  label: string;
  // "Moved from Sat 24", for phones
  short: string;
  // "Sat 24 Oct is a Saturday"
  reason: string;
  // "So it goes out the next working day, Mon 26 Oct"
  outcome: string;
}

/* Why a recurring payment's next date isn't the one its schedule gives, or null when it is */
const movedDate = (payment: Payment, today: Date): MovedDate | null => {
  if (payment.kind !== 'recurring' || !payment.movedFrom || !payment.dueDate) return null;
  const from = formatShortDate(payment.movedFrom, today);
  const weekday = formatShortWeekday(payment.movedFrom);
  return {
    label: `Moved from ${from}`,
    short: `Moved from ${weekday} ${payment.movedFrom.getDate()}`,
    reason: `${from} is ${nonWorkingReason(payment.movedFrom, payment.move.holidays)}`,
    outcome: `So it goes out ${movedHow(payment.move.rule)}, ${formatShortDate(payment.dueDate, today)}`
  };
};

export const dueInfo = (
  payment: Payment,
  { today, cycle }: { today: Date; cycle: PayCycle }
): DueInfo => {
  if (!payment.dueDate)
    return { state: 'ended', days: null, label: 'Ended', detail: 'No upcoming date', moved: null };
  const days = daysBetween(today, payment.dueDate);
  const label = days === 0 ? 'Today' : formatShortDate(payment.dueDate, today);
  const moved = movedDate(payment, today);
  // A paid one-off stays listed until payday, so it reads as paid rather than due
  if (payment.kind === 'oneOff' && payment.paidAt)
    return { state: 'paid', days, label, detail: 'Paid', moved };
  if (days === 0) return { state: 'today', days, label, detail: 'Today', moved };
  if (days < 0) return { state: 'overdue', days, label, detail: 'Overdue', moved };
  const detail = payment.dueDate >= cycle.end ? 'After payday' : capitalise(inDays(days));
  return { state: 'later', days, label, detail, moved };
};
