import { daysBetween } from '~/lib/dates';
import { PayCycle } from '~/lib/payday';
import { formatShortDate } from './labels';
import { Payment } from './payments';

type DueState = 'today' | 'overdue' | 'later' | 'ended';

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
