import { OneOffPaymentFieldsFragment, RecurringPaymentFieldsFragment } from '~/graphql/generated';
import { RecurringPayment } from '~/lib/payments';
import { apiDate, day } from './dates';
import { FakeRecurringPayment } from './fakeApi';

// Each builds a £20 monthly subscription, or a £20 one-off, with only what a test changes given

/* A recurring payment as the API sends it, for toPayments */
export const recurringFields = (
  overrides: Partial<RecurringPaymentFieldsFragment> & { name: string }
): RecurringPaymentFieldsFragment => ({
  __typename: 'RecurringPayment',
  id: overrides.name.toLowerCase(),
  amount: 20,
  category: 'SUBSCRIPTIONS',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-02'),
  lastPaymentDate: null,
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null,
  dueReminder: { __typename: 'ReminderTiming', off: false, days: null },
  renewalReminder: { __typename: 'ReminderTiming', off: false, days: null },
  debt: null,
  account: null,
  paysInto: null,
  iconUrl: null,
  // On its own dates, unless a test is about moving them off weekends
  nonWorkingDay: 'ON_DAY',
  ...overrides
});

/* A one-off payment as the API sends it, for toPayments */
export const oneOffFields = (
  overrides: Partial<OneOffPaymentFieldsFragment> & { name: string }
): OneOffPaymentFieldsFragment => ({
  __typename: 'OneOffPayment',
  id: overrides.name.toLowerCase(),
  amount: 20,
  dueDate: apiDate('2026-10-09'),
  type: 'EXPENSE',
  category: 'GENERAL',
  paidAt: null,
  dueReminder: { __typename: 'ReminderTiming', off: false, days: null },
  account: null,
  iconUrl: null,
  ...overrides
});

/* A recurring payment in the fake API's budget */
export const fakeRecurring = (
  fields: Partial<FakeRecurringPayment> & Pick<FakeRecurringPayment, 'id' | 'name'>
): FakeRecurringPayment => ({
  amount: 20,
  category: 'SUBSCRIPTIONS',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: apiDate('2026-01-02'),
  lastPaymentDate: null,
  // Worked out by the app from the schedule
  nextDueDate: null,
  thisCycle: [],
  renewalDate: null,
  ...fields
});

/* A recurring payment as the app holds it, for the lib functions that take one */
export const recurringPayment = (
  overrides: Partial<RecurringPayment> & { id: string }
): RecurringPayment => {
  const amount = overrides.amount ?? 20;
  return {
    kind: 'recurring',
    account: null,
    into: null,
    paysInto: null,
    iconUrl: null,
    nonWorkingDay: null,
    move: { rule: 'ON_DAY', holidays: new Set() },
    movedFrom: null,
    name: overrides.id,
    amount,
    signedAmount: overrides.type === 'INCOME' ? amount : -amount,
    type: 'EXPENSE',
    category: 'SUBSCRIPTIONS',
    frequency: 'MONTHLY',
    firstPaymentDate: day('2026-01-09'),
    lastPaymentDate: null,
    dueDate: day('2026-10-09'),
    thisCycle: [],
    renewalDate: null,
    dueReminder: { off: false, days: null },
    renewalReminder: { off: false, days: null },
    dueReminderDays: 1,
    renewalReminderDays: 30,
    debt: null,
    ...overrides
  };
};
