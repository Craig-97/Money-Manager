import {
  AccountFieldsFragment,
  OneOffPaymentFieldsFragment,
  PaymentCategory,
  PaymentFrequency,
  PaymentType,
  RecurringPaymentFieldsFragment
} from '~/graphql/generated';
import { fromApiDate } from '~/lib/dates';
import { nextOccurrence } from './recurrence';
import {
  DEFAULT_REMINDER_SETTINGS,
  ReminderSettings,
  ReminderTiming,
  reminderDays
} from './reminderTiming';

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
  // How much less it owes since payday, from payments and overpayments
  paidOffThisCycle: number;
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
  // When the reminder before it's due goes off, as saved: its own timing or the usual one
  dueReminder: ReminderTiming;
  // Days before it's due it reminds, worked out with the usual timing; null when it's off
  dueReminderDays: number | null;
  // The account it goes out of, or an income lands in; null for the one pay lands in
  account: string | null;
}

export interface RecurringPayment extends BasePayment {
  kind: 'recurring';
  category: PaymentCategory;
  frequency: PaymentFrequency;
  firstPaymentDate: Date;
  lastPaymentDate: Date | null;
  // What's been paid or skipped since the cycle started, oldest first
  thisCycle: CycleRecord[];
  // When a policy or contract renews while the payments carry on. Never set on yearly payments,
  // which renew with each payment.
  renewalDate: Date | null;
  // When the reminder before it renews goes off, as saved: its own timing or the usual one
  renewalReminder: ReminderTiming;
  // Days before renewing to show it as coming up, worked out with the usual timing; 0 when it's
  // off (see renewal.ts)
  renewalReminderDays: number;
  // Set when it's paying off a loan or card
  debt: Debt | null;
  // Another account it moves money into, like a standing order
  paysInto: string | null;
  // That account's name, and whether it counts towards the bank balance too. When it does, the
  // money only moves within the bank balance, so it isn't spent and the totals leave it out.
  into: { name: string; counts: boolean } | null;
}

export interface OneOffPayment extends BasePayment {
  kind: 'oneOff';
  category: PaymentCategory;
  // When it was marked paid. It stays until the next payday, so paying can be undone.
  paidAt: Date | null;
}

export type Payment = RecurringPayment | OneOffPayment;

const signed = (amount: number, type: PaymentType) => (type === 'INCOME' ? amount : -amount);

const CYCLE_KINDS = { PAID: 'paid', SKIPPED: 'skipped' } as const;

type IntoAccount = Pick<AccountFieldsFragment, 'id' | 'name' | 'counts'>;

interface RecurringOptions {
  today: Date;
  settings: ReminderSettings;
  accounts: readonly IntoAccount[];
}

const toRecurringPayment = (
  payment: RecurringPaymentFieldsFragment,
  { today, settings, accounts }: RecurringOptions
): RecurringPayment => {
  const into = payment.paysInto
    ? accounts.find(account => account.id === payment.paysInto)
    : undefined;
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
      balanceChange: record.balanceChange
    })),
    renewalDate: fromApiDate(payment.renewalDate),
    dueReminder: payment.dueReminder,
    renewalReminder: payment.renewalReminder,
    dueReminderDays: reminderDays(payment.dueReminder, settings.paymentDays),
    renewalReminderDays: reminderDays(payment.renewalReminder, settings.renewalDays) ?? 0,
    debt: payment.debt
      ? {
          balance: payment.debt.balance,
          startingBalance: payment.debt.startingBalance ?? null,
          apr: payment.debt.apr,
          balanceUpdatedAt: fromApiDate(payment.debt.balanceUpdatedAt),
          paidOffThisCycle: payment.debt.paidOffThisCycle
        }
      : null,
    account: payment.account ?? null,
    paysInto: payment.paysInto ?? null,
    into: into ? { name: into.name, counts: into.counts } : null
  };
};

const toOneOffPayment = (
  payment: OneOffPaymentFieldsFragment,
  settings: ReminderSettings
): OneOffPayment => ({
  kind: 'oneOff',
  id: payment.id,
  name: payment.name,
  amount: payment.amount,
  signedAmount: signed(payment.amount, payment.type),
  type: payment.type,
  category: payment.category,
  dueDate: fromApiDate(payment.dueDate),
  paidAt: fromApiDate(payment.paidAt),
  dueReminder: payment.dueReminder,
  dueReminderDays: reminderDays(payment.dueReminder, settings.paymentDays),
  account: payment.account ?? null
});

interface BudgetPayments {
  recurringPayments?: (RecurringPaymentFieldsFragment | null)[] | null;
  oneOffPayments?: (OneOffPaymentFieldsFragment | null)[] | null;
  // The usual reminder timing, for payments that follow it
  reminderSettings?: ReminderSettings | null;
  // For the account a payment pays into
  accounts?: readonly (IntoAccount | null)[] | null;
}

/* Both kinds of payment on the budget as one list */
export const toPayments = (budget: BudgetPayments, today: Date): Payment[] => {
  const settings = budget.reminderSettings ?? DEFAULT_REMINDER_SETTINGS;
  const accounts = (budget.accounts ?? []).filter(account => account !== null);
  return [
    ...(budget.recurringPayments ?? [])
      .filter(payment => payment !== null)
      .map(payment => toRecurringPayment(payment, { today, settings, accounts })),
    ...(budget.oneOffPayments ?? [])
      .filter(payment => payment !== null)
      .map(payment => toOneOffPayment(payment, settings))
  ];
};

/*
 * The account a payment moves money into when that counts too, so it isn't spent and the totals
 * leave it out: "Joint bills". Null for anything else.
 */
export const movesTo = (payment: Payment) =>
  payment.kind === 'recurring' && payment.into?.counts ? payment.into.name : null;

/* "Into Cash ISA" for a payment into one of the accounts, shown in place of its category */
export const intoText = (payment: Payment) =>
  payment.kind === 'recurring' && payment.into ? `Into ${payment.into.name}` : null;

/* Recurring payments still running, moves between accounts included */
export const activeRecurringCount = (payments: readonly Payment[]) =>
  payments.filter(payment => payment.kind === 'recurring' && payment.dueDate).length;
