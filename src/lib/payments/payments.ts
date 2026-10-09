import {
  OneOffPaymentCategory,
  OneOffPaymentFieldsFragment,
  PaymentFrequency,
  PaymentType,
  RecurringPaymentCategory,
  RecurringPaymentFieldsFragment
} from '~/graphql/generated';
import { fromApiDate } from '~/lib/dates';
import { nextOccurrence } from './recurrence';

export type PaymentKind = 'recurring' | 'oneOff';

export type Outcome = 'paid' | 'skipped';

// One time a recurring payment was paid or skipped: one date, or the rest of a cycle at once
interface Handled {
  outcome: Outcome;
  dates: Date[];
}

interface BasePayment {
  id: string;
  name: string;
  // Always positive; `type` says which way it goes
  amount: number;
  // Negative for money out, so totals can just be summed
  signedAmount: number;
  type: PaymentType;
  // The next date to pay: a one-off's date, or the first of a recurring payment's dates not yet
  // paid or skipped. Null for a recurring payment that has ended.
  dueDate: Date | null;
}

export interface RecurringPayment extends BasePayment {
  kind: 'recurring';
  category: RecurringPaymentCategory;
  frequency: PaymentFrequency;
  firstPaymentDate: Date;
  lastPaymentDate: Date | null;
  // What's been paid or skipped since the cycle started, oldest first
  handled: Handled[];
  // When a policy or contract renews while the payments carry on. Never set on yearly payments,
  // which renew with each payment.
  renewalDate: Date | null;
  // Days before renewing to show it as coming up, 0 for none (see renewal.ts)
  renewalReminderDays: number;
}

export interface OneOffPayment extends BasePayment {
  kind: 'oneOff';
  category: OneOffPaymentCategory;
}

export type Payment = RecurringPayment | OneOffPayment;

const signed = (amount: number, type: PaymentType) => (type === 'INCOME' ? amount : -amount);

const OUTCOMES = { PAID: 'paid', SKIPPED: 'skipped' } as const;

const toRecurringPayment = (
  payment: RecurringPaymentFieldsFragment,
  today: Date
): RecurringPayment => {
  const firstPaymentDate = fromApiDate(payment.firstPaymentDate) ?? today;
  const lastPaymentDate = fromApiDate(payment.lastPaymentDate);
  // Payments saved before the API tracked due dates don't have one, so work it out
  const dueDate =
    fromApiDate(payment.nextDueDate) ??
    nextOccurrence({ firstPaymentDate, frequency: payment.frequency, lastPaymentDate }, today);

  return {
    kind: 'recurring',
    id: payment.id,
    name: payment.name,
    amount: payment.amount,
    signedAmount: signed(payment.amount, payment.type),
    type: payment.type,
    category: payment.category,
    frequency: payment.frequency,
    firstPaymentDate,
    lastPaymentDate,
    dueDate,
    handled: payment.handled.map(entry => ({
      outcome: OUTCOMES[entry.outcome],
      dates: entry.dates.map(date => fromApiDate(date)!)
    })),
    renewalDate: fromApiDate(payment.renewalDate),
    renewalReminderDays: payment.renewalReminderDays
  };
};

const toOneOffPayment = (payment: OneOffPaymentFieldsFragment): OneOffPayment => ({
  kind: 'oneOff',
  id: payment.id,
  name: payment.name,
  amount: payment.amount,
  signedAmount: signed(payment.amount, payment.type),
  type: payment.type,
  category: payment.category,
  // Paying a one-off deletes it, so the ones left are always still to pay
  dueDate: fromApiDate(payment.dueDate)
});

interface AccountPayments {
  recurringPayments?: (RecurringPaymentFieldsFragment | null)[] | null;
  oneOffPayments?: (OneOffPaymentFieldsFragment | null)[] | null;
}

/* Both kinds of payment on the account as one list */
export const toPayments = (account: AccountPayments, today: Date): Payment[] => [
  ...(account.recurringPayments ?? [])
    .filter(payment => payment !== null)
    .map(payment => toRecurringPayment(payment, today)),
  ...(account.oneOffPayments ?? []).filter(payment => payment !== null).map(toOneOffPayment)
];
