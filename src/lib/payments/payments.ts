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

export type CycleRecordKind = 'paid' | 'skipped';

// One time a recurring payment was paid or skipped this cycle: one date, or the rest of a cycle at
// once. It's a payment record on the API; undoing it deletes the record.
export interface CycleRecord {
  id: string;
  kind: CycleRecordKind;
  dates: Date[];
  // What it did to the bank balance: negative for money out, 0 for a skip
  balanceChange: number;
  // How much less a debt owes after it; 0 when the payment isn't a debt
  debtReduction: number;
}

// A loan or card the payment is paying off
export interface Debt {
  // What's left to pay
  balance: number;
  // What was borrowed, if known
  startingBalance: number | null;
  // Yearly interest rate as a percentage, e.g. 24.9
  apr: number;
  // When the balance was last set by hand, e.g. from a statement
  balanceUpdatedAt: Date | null;
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
  thisCycle: CycleRecord[];
  // When a policy or contract renews while the payments carry on. Never set on yearly payments,
  // which renew with each payment.
  renewalDate: Date | null;
  // Days before renewing to show it as coming up, 0 for none (see renewal.ts)
  renewalReminderDays: number;
  // Set when it's paying off a loan or card
  debt: Debt | null;
}

export interface OneOffPayment extends BasePayment {
  kind: 'oneOff';
  category: OneOffPaymentCategory;
  // When it was marked paid. It stays until the next payday, so paying can be undone.
  paidAt: Date | null;
}

export type Payment = RecurringPayment | OneOffPayment;

const signed = (amount: number, type: PaymentType) => (type === 'INCOME' ? amount : -amount);

const CYCLE_KINDS = { PAID: 'paid', SKIPPED: 'skipped' } as const;

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
    thisCycle: payment.thisCycle.map(record => ({
      id: record.id,
      // Only pays and skips count towards the cycle
      kind: CYCLE_KINDS[record.kind as keyof typeof CYCLE_KINDS],
      dates: record.dates.map(date => fromApiDate(date)!),
      balanceChange: record.balanceChange,
      debtReduction: record.debt?.reduction ?? 0
    })),
    renewalDate: fromApiDate(payment.renewalDate),
    renewalReminderDays: payment.renewalReminderDays,
    debt: payment.debt
      ? {
          balance: payment.debt.balance,
          startingBalance: payment.debt.startingBalance ?? null,
          apr: payment.debt.apr,
          balanceUpdatedAt: fromApiDate(payment.debt.balanceUpdatedAt)
        }
      : null
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
  dueDate: fromApiDate(payment.dueDate),
  paidAt: fromApiDate(payment.paidAt)
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
