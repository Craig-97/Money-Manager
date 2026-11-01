import { addDays } from '~/lib/dates';
import { scheduleText } from './labels';
import { Payment } from './payments';
import { nextOccurrence } from './recurrence';

export type QuickEditMode = 'amount' | 'date';

/*
 * Which quick edits a payment offers. A recurring payment that has ended has nothing left to
 * change, and a one-off that's been paid has already gone out at its amount and date.
 */
export const quickEdits = (payment: Payment) => {
  const open = payment.kind === 'recurring' ? !!payment.dueDate : !payment.paidAt;
  return { amount: open, date: open };
};

/*
 * The first day a payment can move to: from today, and after anything already paid or skipped
 * this cycle, so a payment already made isn't due again in the same cycle.
 */
export const earliestNewDate = (payment: Payment, today: Date) => {
  if (payment.kind !== 'recurring') return today;
  const dealtWith = payment.thisCycle.flatMap(record => record.dates);
  const latest = dealtWith.reduce<Date | null>(
    (last, date) => (!last || date > last ? date : last),
    null
  );
  return latest && latest >= today ? addDays(latest, 1) : today;
};

/* The payment as it would be with a new amount, for this payment and every one after */
export const withAmount = (payment: Payment, amount: number): Payment => ({
  ...payment,
  amount,
  signedAmount: payment.type === 'INCOME' ? amount : -amount
});

/*
 * The payment as it would be with a new date. A recurring payment's schedule carries on from it,
 * starting afresh as the API does when the schedule changes: nothing paid or skipped against it.
 */
export const withDate = (payment: Payment, { date, today }: { date: Date; today: Date }) =>
  payment.kind === 'recurring'
    ? {
        ...payment,
        firstPaymentDate: date,
        dueDate: nextOccurrence({ ...payment, firstPaymentDate: date }, today),
        thisCycle: []
      }
    : { ...payment, dueDate: date };

/* "monthly on the 30th": how a recurring payment repeats from a new date */
export const repeatsFrom = (payment: Payment, date: Date) =>
  payment.kind === 'recurring'
    ? scheduleText(date, { frequency: payment.frequency, lower: true })
    : null;
