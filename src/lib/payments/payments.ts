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

// Where the payment stands this cycle
export type PaymentState = 'unpaid' | 'paid' | 'skipped';

interface BasePayment {
  id: string;
  name: string;
  // Always positive; `type` says which way it goes
  amount: number;
  // Negative for money out, so totals can just be summed
  signedAmount: number;
  type: PaymentType;
  // When it's due this cycle; null for a recurring payment that has ended
  dueDate: Date | null;
  state: PaymentState;
}

export interface RecurringPayment extends BasePayment {
  kind: 'recurring';
  category: RecurringPaymentCategory;
  frequency: PaymentFrequency;
  firstPaymentDate: Date;
  lastPaymentDate: Date | null;
}

export interface OneOffPayment extends BasePayment {
  kind: 'oneOff';
  category: OneOffPaymentCategory;
}

export type Payment = RecurringPayment | OneOffPayment;

const signed = (amount: number, type: PaymentType) => (type === 'INCOME' ? amount : -amount);

const RECURRING_STATE = { UNPAID: 'unpaid', PAID: 'paid', SKIPPED: 'skipped' } as const;

export const toRecurringPayment = (
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
    state: RECURRING_STATE[payment.status]
  };
};

export const toOneOffPayment = (payment: OneOffPaymentFieldsFragment): OneOffPayment => ({
  kind: 'oneOff',
  id: payment.id,
  name: payment.name,
  amount: payment.amount,
  signedAmount: signed(payment.amount, payment.type),
  type: payment.type,
  category: payment.category,
  dueDate: fromApiDate(payment.dueDate),
  state: payment.paid ? 'paid' : 'unpaid'
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
