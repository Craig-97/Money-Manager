// Not through the client barrel: its client.ts loads this file, so that would be a loop
import { createApolloClient } from '~/graphql/client/createApolloClient';
import { addDays, daysBetween, startOfToday, toIsoDate } from '~/lib/dates';
import { roundPence } from '~/lib/format';
import { useAuthStore } from '~/state/auth';
import { fakeRecurring } from '~/test/builders';
import { apiDate, apiDateFromToday as fromToday } from '~/test/dates';
import {
  createFakeApi,
  DEFAULT_USER,
  FakeAccount,
  FakeAccountChange,
  FakeBudget,
  FakeNote,
  FakeOneOffPayment,
  fakeRecord,
  FakeRecurringPayment
} from '~/test/fakeApi';

/*
 * Development only (VITE_MOCK_API=true): the app runs against the in-memory fake API from the
 * tests, already signed in, so pages can be reviewed and screenshotted without the real API or a
 * database. Data resets on every page load. Add ?mock=<scenario> to the URL for other states:
 *   setup    - no budget yet, so setup shows
 *   payday   - today is payday, so the payday prompt shows
 *   away     - payday too, but the app wasn't opened for the last three, so it adds three pays
 *   empty    - a budget with no payments or notes
 *   overdrawn - more going out before payday than is in the bank
 *   debts    - the design's three debts: a credit card, car finance and a loan from family
 *   reminders - the design's reminders: Spotify overdue, renewals, dated notes
 *   interest - away for three months: three interest payments added at once, and the debts
 */

// The next Saturday after today
const comingSaturday = () => {
  const today = startOfToday();
  return addDays(today, (6 - today.getDay() + 7) % 7 || 7);
};
const addMonths = (date: Date, months: number) =>
  new Date(date.getFullYear(), date.getMonth() + months, date.getDate());

/*
 * A recurring payment due some days from today: monthly, first paid a year before unless
 * startedInDays says when, and renewing if renewInDays is given. A debt brings its balance, the
 * interest built up since its last payment, and its past payments.
 */
const mockPayment = ({
  dueInDays,
  startedInDays = dueInDays - 365,
  renewInDays,
  debt,
  paid = 3,
  ...fields
}: Pick<FakeRecurringPayment, 'id' | 'name' | 'amount' | 'category'> &
  Partial<Omit<FakeRecurringPayment, 'debt'>> & {
    dueInDays: number;
    startedInDays?: number;
    renewInDays?: number;
    // Paid monthly, with a balance set from a statement a few weeks ago
    debt?: { balance: number; startingBalance: number; apr: number };
    // How many past payments a debt has, for its history
    paid?: number;
  }): FakeRecurringPayment =>
  fakeRecurring({
    firstPaymentDate: fromToday(startedInDays),
    nextDueDate: fromToday(dueInDays),
    renewalDate: renewInDays === undefined ? null : fromToday(renewInDays),
    ...(debt && {
      history: pastPayments({ amount: fields.amount, dueInDays, debt, count: paid }),
      // Its last payment was a month before the next
      debt: {
        ...debt,
        balanceUpdatedAt: fromToday(-21),
        accrued: 0,
        accruedTo: fromToday(dueInDays - 30)
      }
    }),
    ...fields
  });

// Netflix's last nine months: up from £18 three months ago, and one skipped
const netflixHistory = () =>
  Array.from({ length: 9 }, (_, i) => {
    const dates = [apiDate(toIsoDate(addMonths(startOfToday(), -(i + 1))))];
    const record =
      i === 5
        ? fakeRecord('SKIPPED', { dates })
        : fakeRecord('PAID', { dates, balanceChange: i < 3 ? -20 : -18 });
    return { ...record, open: false };
  });

// Easy access since its history started: interest each month, money moved in and out, and a
// balance typed in
const easyAccessHistory = (): FakeAccountChange[] => {
  const change = (
    kind: FakeAccountChange['kind'],
    {
      days,
      amount,
      after,
      name = null
    }: { days: number; amount: number; after: number; name?: string | null }
  ) => ({
    id: `easy-${kind}-${days}`,
    kind,
    date: fromToday(days),
    change: amount,
    balanceAfter: after,
    name
  });
  return [
    change('BALANCE_SET', { days: -9, amount: -4.12, after: 4200 }),
    change('MOVE_IN', { days: -18, amount: 500, after: 4204.12, name: 'Current account' }),
    change('INTEREST', { days: -32, amount: 12.42, after: 3704.12 }),
    change('MOVE_OUT', { days: -47, amount: -250, after: 3691.7, name: 'Current account' }),
    change('INTEREST', { days: -62, amount: 13.09, after: 3941.7 }),
    change('INTEREST', { days: -93, amount: 13.27, after: 3928.61 }),
    change('OPENING', { days: -120, amount: 3915.34, after: 3915.34 })
  ];
};

// The accounts scenario's other spending accounts: a joint one for bills, a holiday one that
// would go below £0 before payday, and a spare card that's already below it
const demoSpendingAccounts = (): FakeAccount[] => [
  {
    id: 'joint',
    name: 'Joint bills',
    kind: 'SPENDING',
    balance: 2105,
    counts: true,
    interest: null,
    purpose: 'Shared household bills',
    balanceUpdatedAt: fromToday(-3)
  },
  {
    id: 'holiday',
    name: 'Holiday spending',
    kind: 'SPENDING',
    balance: 180,
    counts: true,
    interest: null,
    purpose: null,
    balanceUpdatedAt: fromToday(0)
  },
  {
    // Already below £0, with nothing going out of it before payday
    id: 'spare',
    name: 'Spare card',
    kind: 'SPENDING',
    balance: -40,
    counts: true,
    interest: null,
    purpose: null,
    balanceUpdatedAt: fromToday(-1)
  }
];

// Bills out of Joint bills, water not saying which account yet, and a top-up into it
const demoJointPayments = (): FakeRecurringPayment[] => [
  mockPayment({
    id: 'energy',
    name: 'Energy',
    amount: 120,
    category: 'BILLS',
    dueInDays: 7,
    account: 'joint'
  }),
  mockPayment({
    id: 'broadband',
    name: 'Broadband',
    amount: 32,
    category: 'BILLS',
    dueInDays: 12,
    account: 'joint'
  }),
  mockPayment({ id: 'water', name: 'Water', amount: 43.02, category: 'BILLS', dueInDays: 16 }),
  mockPayment({
    id: 'joint-top-up',
    name: 'Joint bills top-up',
    amount: 600,
    category: 'BILLS',
    dueInDays: 5,
    paysInto: 'joint'
  })
];

const demoHolidayPayments = (): FakeOneOffPayment[] => [
  {
    id: 'hotel',
    name: 'Hotel deposit',
    amount: 220,
    dueDate: fromToday(9),
    type: 'EXPENSE',
    category: 'HOLIDAYS',
    account: 'holiday'
  }
];

// The design's example data, moved so it's always current
const demoBudget = (scenario: string | null): FakeBudget => {
  const today = startOfToday();
  const payday =
    scenario === 'payday' || scenario === 'away'
      ? { type: 'SET_DAY', dayOfMonth: today.getDate() }
      : { type: 'LAST_WEEKDAY', weekday: 'FRIDAY', dayOfMonth: null };

  const budget: FakeBudget = {
    id: 'budget-1',
    bankBalance: scenario === 'overdrawn' ? 420 : 10000,
    monthlyIncome: 3600,
    // As the API starts a budget: weekend and bank holiday dates go out the next working day
    nonWorkingDay: 'NEXT',
    // The design's savings: a Cash ISA last updated five weeks ago, so its reminder shows
    accounts: [
      {
        id: 'easy',
        name: 'Easy access',
        kind: 'SAVINGS',
        balance: 4200,
        // Counted in the accounts scenario, so the bank balance opens as a dialog
        counts: scenario === 'accounts',
        // Paid yesterday, so the app adds it as it opens and asks to check it. Away for three
        // months in the interest scenario, so it adds three.
        interest: {
          rate: 4.1,
          frequency: 'MONTHLY',
          day: addDays(startOfToday(), -1).getDate(),
          nextDate:
            scenario === 'interest'
              ? apiDate(toIsoDate(addMonths(addDays(startOfToday(), -1), -2)))
              : fromToday(-1),
          accrued: 0,
          accruedTo: fromToday(-31)
        },
        purpose: null,
        balanceUpdatedAt: fromToday(-9),
        history: easyAccessHistory()
      },
      {
        id: 'isa',
        name: 'Cash ISA',
        kind: 'SAVINGS',
        balance: 8650,
        counts: false,
        interest: {
          rate: 4.5,
          frequency: 'MONTHLY',
          day: addDays(startOfToday(), 10).getDate(),
          nextDate: fromToday(10),
          // Building up since its last payment
          accrued: 0,
          accruedTo: fromToday(-20)
        },
        purpose: null,
        balanceUpdatedAt: fromToday(-36)
      },
      {
        id: 'pot',
        name: 'Bills pot',
        kind: 'SAVINGS',
        balance: 1240,
        counts: false,
        interest: null,
        purpose: 'For yearly bills',
        balanceUpdatedAt: fromToday(0)
      }
    ],
    // The payday scenario hasn't started this cycle yet, so the prompt shows
    cycleStartedOn:
      scenario === 'payday'
        ? null
        : scenario === 'away'
          ? apiDate(toIsoDate(addMonths(today, -3)))
          : fromToday(0),
    payday: {
      id: 'payday-1',
      frequency: 'MONTHLY',
      weekday: null,
      firstPayDate: null,
      bankHolidayRegion: 'ENGLAND_AND_WALES',
      overrides: [],
      ...payday
    },
    recurringPayments: [
      mockPayment({
        id: 'netflix',
        name: 'Netflix',
        amount: 20,
        category: 'SUBSCRIPTIONS',
        dueInDays: 0,
        startedInDays: -273,
        history: netflixHistory()
      }),
      mockPayment({
        id: 'mortgage',
        name: 'Mortgage',
        amount: scenario === 'overdrawn' ? 1250 : 750,
        category: 'BILLS',
        // On payday it's left over from the last cycle, so the prompt offers to move it on
        dueInDays: scenario === 'payday' ? -2 : 24,
        startedInDays: -247
      }),
      mockPayment({
        id: 'prime',
        name: 'Amazon Prime',
        amount: 95,
        category: 'SUBSCRIPTIONS',
        frequency: 'ANNUALLY',
        dueInDays: 272,
        startedInDays: -93
      }),
      mockPayment({
        // Weekly, so it's due more than once before payday: the ×2 tag and its dates
        id: 'cleaner',
        name: 'Cleaner',
        amount: 50,
        category: 'BILLS',
        frequency: 'WEEKLY',
        dueInDays: 1,
        startedInDays: -27
      }),
      mockPayment({
        // Due on the coming Saturday, so it goes out the Monday after: the Moved from tag
        id: 'car-insurance',
        name: 'Car insurance',
        amount: 52,
        category: 'BILLS',
        dueInDays: daysBetween(startOfToday(), comingSaturday()),
        firstPaymentDate: apiDate(toIsoDate(addMonths(comingSaturday(), -6)))
      }),
      mockPayment({
        id: 'isa-top-up',
        name: 'ISA top-up',
        amount: 250,
        category: 'SAVINGS',
        dueInDays: 3,
        startedInDays: -180,
        paysInto: 'isa'
      })
    ],
    oneOffPayments: [
      {
        id: 'shopping',
        name: 'Shopping',
        amount: 10,
        dueDate: fromToday(7),
        type: 'INCOME',
        category: 'GENERAL'
      },
      {
        id: 'birthday',
        name: 'Birthday',
        amount: 75,
        dueDate: fromToday(scenario === 'payday' ? -10 : 18),
        type: 'EXPENSE',
        category: 'GIFTS'
      }
    ],
    notes: [
      ['Update this note', 'BLUE', 0],
      ['Added a new note', 'GREEN', 1],
      ['Test Note\n\nDo Da Dee', 'AMBER', 2],
      ['New Note', 'VIOLET', 3],
      ['I am a long note\nI am a long note\nI am a long note\nI am a long note', 'ROSE', 4]
    ]
      .map(([body, color, age], index): FakeNote => {
        const at = String(Date.now() - Number(age) * 3_600_000);
        return {
          id: `note-${index + 1}`,
          body: String(body),
          color: String(color),
          createdAt: at,
          updatedAt: at
        };
      })
      .concat([
        {
          // On the cleaner, so a weekly payment shows its note chip as well
          id: 'note-cleaner',
          body: 'Sarah. Cash or a bank transfer. Skip the weeks we are away in December.',
          color: 'AMBER',
          createdAt: String(Date.now() - 86_400_000),
          updatedAt: String(Date.now() - 86_400_000),
          payment: 'cleaner'
        }
      ])
  };

  if (scenario === 'empty') {
    return { ...budget, recurringPayments: [], oneOffPayments: [], notes: [] };
  }
  if (scenario === 'debts' || scenario === 'interest') {
    return { ...budget, recurringPayments: [...budget.recurringPayments, ...demoDebts()] };
  }
  if (scenario === 'accounts') {
    return {
      ...budget,
      accounts: [...demoSpendingAccounts(), ...(budget.accounts ?? [])],
      recurringPayments: [...budget.recurringPayments, ...demoJointPayments()],
      oneOffPayments: [...budget.oneOffPayments, ...demoHolidayPayments()]
    };
  }
  if (scenario === 'payday') {
    // A second account to spend from, with a bill left over from last cycle out of it and its
    // top-up due today, so the prompt shows which account each goes out of
    return {
      ...budget,
      accounts: [demoSpendingAccounts()[0], ...(budget.accounts ?? [])],
      recurringPayments: [
        ...budget.recurringPayments,
        mockPayment({
          id: 'energy',
          name: 'Energy',
          amount: 120,
          category: 'BILLS',
          dueInDays: -3,
          account: 'joint'
        }),
        mockPayment({
          id: 'joint-top-up',
          name: 'Joint bills top-up',
          amount: 600,
          category: 'BILLS',
          dueInDays: 0,
          paysInto: 'joint'
        })
      ]
    };
  }
  if (scenario === 'reminders') {
    return {
      ...budget,
      recurringPayments: [...budget.recurringPayments, ...demoReminderPayments()],
      notes: [...demoDatedNotes(), ...budget.notes]
    };
  }
  return budget;
};

// Spotify went by unpaid yesterday; home insurance renews in five weeks with a note about it
const demoReminderPayments = () => [
  mockPayment({
    id: 'spotify',
    name: 'Spotify',
    amount: 20,
    category: 'SUBSCRIPTIONS',
    dueInDays: -1
  }),
  mockPayment({ id: 'energy', name: 'Energy', amount: 120, category: 'BILLS', dueInDays: 1 }),
  mockPayment({
    id: 'home-insurance',
    name: 'Home insurance',
    amount: 612,
    category: 'FINANCES',
    frequency: 'ANNUALLY',
    dueInDays: 36
  }),
  mockPayment({
    id: 'prescription',
    name: 'Prescription',
    amount: 114.5,
    category: 'PERSONAL_CARE',
    frequency: 'BIANNUALLY',
    dueInDays: 25
  }),
  mockPayment({
    id: 'phone',
    name: 'Phone contract',
    amount: 32,
    category: 'BILLS',
    dueInDays: 12,
    renewInDays: 109
  })
];

const demoDatedNotes = () =>
  [
    {
      id: 'note-quotes',
      body: 'Home insurance quotes. Get three quotes before renewing.',
      color: 'AMBER',
      date: fromToday(36),
      remind: [30, 7],
      repeat: 'YEARLY' as const,
      payment: 'home-insurance'
    },
    {
      id: 'note-prescription',
      body: 'Book the prescription review with the GP before the next prepayment certificate.',
      color: 'GREEN',
      date: null,
      remind: [14],
      repeat: 'WITH_PAYMENT' as const,
      payment: 'prescription'
    },
    {
      id: 'note-mot',
      body: 'Car MOT and service at the garage on the high street. Ask them to check the tyres and the brake pads while it’s in.',
      color: 'BLUE',
      date: fromToday(20),
      remind: [14],
      repeat: 'YEARLY' as const,
      payment: null
    }
  ].map(note => ({ ...note, createdAt: String(Date.now()), updatedAt: String(Date.now()) }));

/*
 * Its last few monthly payments, newest first, from before this cycle so they can't be undone,
 * with the interest each one paid as the API works it out
 */
const pastPayments = ({
  amount,
  dueInDays,
  debt: { balance, apr },
  count
}: {
  amount: number;
  dueInDays: number;
  debt: { balance: number; apr: number };
  count: number;
}) => {
  let after = balance;
  return Array.from({ length: count }, (_, i) => i + 1).map(monthsAgo => {
    const before = (after + amount) / (1 + apr / 100 / 12);
    const interest = roundPence(before * (apr / 100 / 12));
    const record = {
      ...fakeRecord('PAID', {
        dates: [fromToday(dueInDays - monthsAgo * 30)],
        balanceChange: -amount,
        debt: {
          interest,
          reduction: roundPence(amount - interest),
          balanceAfter: roundPence(after)
        }
      }),
      open: false
    };
    after = before;
    return record;
  });
};

const demoDebts = () => [
  mockPayment({
    id: 'credit-card',
    name: 'Credit card',
    category: 'FINANCES',
    amount: 150,
    dueInDays: 13,
    debt: {
      balance: 2340,
      startingBalance: 3500,
      apr: 24.9
    },
    paid: 18
  }),
  mockPayment({
    id: 'car-finance',
    name: 'Car finance',
    category: 'FINANCES',
    amount: 245,
    dueInDays: 24,
    debt: {
      balance: 6860,
      startingBalance: 12000,
      apr: 6.9
    }
  }),
  mockPayment({
    id: 'family-loan',
    name: 'Family loan',
    category: 'FINANCES',
    amount: 100,
    dueInDays: 30,
    debt: {
      balance: 800,
      startingBalance: 1500,
      apr: 0
    }
  })
];

export const createMockClient = () => {
  const scenario = new URLSearchParams(window.location.search).get('mock');
  const api = createFakeApi({ budget: scenario === 'setup' ? null : demoBudget(scenario) });

  useAuthStore.setState({
    session: { token: 'test-token', userId: DEFAULT_USER.id, expiresAt: Date.now() + 86_400_000 },
    endReason: null
  });

  return createApolloClient({ terminatingLink: api.link });
};
