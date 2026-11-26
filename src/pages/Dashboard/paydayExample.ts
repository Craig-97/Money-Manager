import { AccountFieldsFragment, RecurringPaymentFieldsFragment } from '~/graphql/generated';
import { addDays, toIsoDate } from '~/lib/dates';
import { BankHolidays, PayCycle } from '~/lib/payday';
import { toPayments } from '~/lib/payments';

/*
 * Made-up money for the tour's look at the payday prompt, so every step has something in it
 * however little was entered in Setup: two payments left from last cycle, one due today, and
 * savings not updated for a while.
 */

const NO_HOLIDAYS: BankHolidays = new Set();
const REMINDER = { __typename: 'ReminderTiming', off: false, days: null } as const;

const account = (
  fields: Pick<AccountFieldsFragment, 'id' | 'name' | 'kind' | 'balance' | 'paidInto'>,
  updated: Date
): AccountFieldsFragment => ({
  __typename: 'Account',
  counts: fields.kind === 'SPENDING',
  purpose: null,
  iconUrl: null,
  interest: null,
  balanceUpdatedAt: toIsoDate(updated),
  ...fields
});

const monthly = (
  fields: Pick<RecurringPaymentFieldsFragment, 'id' | 'name' | 'amount' | 'category'>,
  due: Date
): RecurringPaymentFieldsFragment => ({
  __typename: 'RecurringPayment',
  frequency: 'MONTHLY',
  type: 'EXPENSE',
  firstPaymentDate: toIsoDate(due),
  lastPaymentDate: null,
  nextDueDate: toIsoDate(due),
  renewalDate: null,
  account: null,
  paysInto: null,
  // Always the date given, so no weekend moves it out of last cycle
  nonWorkingDay: 'ON_DAY',
  iconUrl: null,
  dueReminder: REMINDER,
  renewalReminder: REMINDER,
  thisCycle: [],
  debt: null,
  ...fields
});

/* The example as of today, which is payday */
export const paydayExample = (today: Date) => {
  const cycle: PayCycle = {
    start: today,
    end: addDays(today, 30),
    endUsual: addDays(today, 30),
    isPayday: true
  };
  const accounts = [
    account(
      {
        id: 'example-current',
        name: 'Current account',
        kind: 'SPENDING',
        balance: 1240.5,
        paidInto: true
      },
      today
    ),
    account(
      { id: 'example-isa', name: 'Cash ISA', kind: 'SAVINGS', balance: 4250, paidInto: false },
      addDays(today, -40)
    )
  ];
  const recurringPayments = [
    monthly(
      { id: 'example-netflix', name: 'Netflix', amount: 10.99, category: 'SUBSCRIPTIONS' },
      addDays(today, -9)
    ),
    monthly(
      { id: 'example-phone', name: 'Phone', amount: 24, category: 'BILLS' },
      addDays(today, -4)
    ),
    monthly({ id: 'example-gym', name: 'Gym', amount: 30, category: 'PERSONAL_CARE' }, today)
  ];

  return {
    cycle,
    holidays: NO_HOLIDAYS,
    budget: {
      id: 'example',
      bankBalance: 1240.5,
      accounts,
      monthlyIncome: 2600,
      cycleStartedOn: toIsoDate(addDays(today, -30)),
      payday: null
    },
    payments: toPayments({ recurringPayments, accounts }, { today, holidays: NO_HOLIDAYS })
  };
};
