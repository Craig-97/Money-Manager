import { fromApiDate, parseIsoDate } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import {
  DEFAULT_REMINDER_SETTINGS,
  FREQUENCY_LABELS,
  formatShortDate,
  nextOccurrence,
  OneOffPayment,
  RecurringPayment,
  reminderDays,
  ReminderTiming,
  USUAL_TIMING
} from '~/lib/payments';
import { SetupAccountView, SetupOneOff, SetupRegular } from './setupModel';

/*
 * Setup's payments as the rest of the app sees them, so the payment form can open one to change,
 * and the line under each in setup's lists.
 */

const day = (iso: string | null | undefined) => parseIsoDate(iso) ?? fromApiDate(iso) ?? null;
const timing = (
  input: { off: boolean; days?: number | null } | null | undefined
): ReminderTiming => (input ? { off: input.off, days: input.days ?? null } : USUAL_TIMING);
const signed = (amount: number, type: string) => (type === 'INCOME' ? amount : -amount);

export const regularAsPayment = (
  { id, input }: SetupRegular,
  { today }: { today: Date }
): RecurringPayment => {
  const firstPaymentDate = day(input.firstPaymentDate) ?? today;
  const lastPaymentDate = day(input.lastPaymentDate);
  const dueReminder = timing(input.dueReminder);
  const renewalReminder = timing(input.renewalReminder);
  return {
    kind: 'recurring',
    id,
    name: input.name,
    amount: input.amount,
    signedAmount: signed(input.amount, input.type),
    type: input.type,
    category: input.category,
    frequency: input.frequency,
    firstPaymentDate,
    lastPaymentDate,
    dueDate: nextOccurrence(
      { firstPaymentDate, frequency: input.frequency, lastPaymentDate },
      today
    ),
    thisCycle: [],
    renewalDate: day(input.renewalDate),
    dueReminder,
    renewalReminder,
    dueReminderDays: reminderDays(dueReminder, DEFAULT_REMINDER_SETTINGS.paymentDays),
    renewalReminderDays: reminderDays(renewalReminder, DEFAULT_REMINDER_SETTINGS.renewalDays) ?? 0,
    debt: input.debt
      ? {
          balance: input.debt.balance,
          startingBalance: input.debt.startingBalance ?? null,
          apr: input.debt.apr,
          balanceUpdatedAt: null,
          paidOffThisCycle: 0
        }
      : null,
    account: input.account ?? null,
    paysInto: input.paysInto ?? null
  };
};

export const oneOffAsPayment = ({ id, input }: SetupOneOff): OneOffPayment => {
  const dueReminder = timing(input.dueReminder);
  return {
    kind: 'oneOff',
    id,
    name: input.name,
    amount: input.amount,
    signedAmount: signed(input.amount, input.type),
    type: input.type,
    category: input.category,
    dueDate: day(input.dueDate),
    paidAt: null,
    dueReminder,
    dueReminderDays: reminderDays(dueReminder, DEFAULT_REMINDER_SETTINGS.paymentDays),
    account: input.account ?? null
  };
};

const nameOf = (accounts: readonly SetupAccountView[], key: string | null | undefined) =>
  key ? (accounts.find(account => account.id === key)?.name ?? null) : null;

/*
 * The line under a payment in setup's lists: how often and when, then what else it does. "Monthly ·
 * Thu 25 Oct · Renews 2 Feb 2027", "Monthly · Thu 15 Oct · Debt · £2,340.00 left", "Into Cash ISA".
 */
export const regularDetails = (
  { input }: SetupRegular,
  { accounts, today }: { accounts: readonly SetupAccountView[]; today: Date }
) => {
  const first = day(input.firstPaymentDate);
  const renewal = day(input.renewalDate);
  const into = nameOf(accounts, input.paysInto);
  const from = nameOf(accounts, input.account);
  return [
    FREQUENCY_LABELS[input.frequency],
    first ? formatShortDate(first, today) : null,
    renewal ? `Renews ${formatShortDate(renewal, today)}` : null,
    input.debt ? `Debt · ${formatMoney(input.debt.balance)} left` : null,
    into ? `Into ${into}` : null,
    from && input.account ? `${input.type === 'INCOME' ? 'Into' : 'From'} ${from}` : null
  ]
    .filter(Boolean)
    .join(' · ');
};

export const oneOffDetails = (
  { input }: SetupOneOff,
  { accounts, today }: { accounts: readonly SetupAccountView[]; today: Date }
) => {
  const due = day(input.dueDate);
  const from = nameOf(accounts, input.account);
  return [
    due ? formatShortDate(due, today) : null,
    from && input.account ? `${input.type === 'INCOME' ? 'Into' : 'From'} ${from}` : null
  ]
    .filter(Boolean)
    .join(' · ');
};
