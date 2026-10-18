import { createApolloClient } from '~/graphql/client/createApolloClient';
import { addDays, startOfToday, toIsoDate } from '~/lib/dates';
import { useAuthStore } from '~/state/auth';
import { apiDate, createFakeApi, DEFAULT_USER, FakeAccount, fakeRecord } from '~/test/fakeApi';

/*
 * Development only (VITE_MOCK_API=true): the app runs against the in-memory fake API from the
 * tests, already signed in, so pages can be reviewed and screenshotted without the real API or a
 * database. Data resets on every page load. Add ?mock=<scenario> to the URL for other states:
 *   setup    - no account yet, so setup shows
 *   payday   - today is payday, so the payday prompt shows
 *   empty    - an account with no payments or notes
 *   overdrawn - more going out before payday than is in the bank
 *   debts    - the design's three debts: a credit card, car finance and a loan from family
 *   reminders - the design's reminders: Spotify overdue, renewals, dated notes
 */

const fromToday = (days: number) => apiDate(toIsoDate(addDays(startOfToday(), days)));

// The design's example data, moved so it's always current
const demoAccount = (scenario: string | null): FakeAccount => {
  const today = startOfToday();
  const payday =
    scenario === 'payday'
      ? { type: 'SET_DAY', dayOfMonth: today.getDate() }
      : { type: 'LAST_WEEKDAY', weekday: 'FRIDAY', dayOfMonth: null };

  const account: FakeAccount = {
    id: 'account-1',
    bankBalance: scenario === 'overdrawn' ? 420 : 10000,
    monthlyIncome: 3600,
    // The payday scenario hasn't started this cycle yet, so the prompt shows
    cycleStartedOn: scenario === 'payday' ? null : fromToday(0),
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
      {
        id: 'netflix',
        name: 'Netflix',
        amount: 20,
        category: 'SUBSCRIPTION',
        frequency: 'MONTHLY',
        type: 'EXPENSE',
        firstPaymentDate: fromToday(-273),
        lastPaymentDate: null,
        nextDueDate: fromToday(0),
        thisCycle: [],
        renewalDate: null
      },
      {
        id: 'mortgage',
        name: 'Mortgage',
        amount: scenario === 'overdrawn' ? 1250 : 750,
        category: 'MORTGAGE',
        frequency: 'MONTHLY',
        type: 'EXPENSE',
        firstPaymentDate: fromToday(-247),
        lastPaymentDate: null,
        // On payday it's left over from the last cycle, so the prompt offers to move it on
        nextDueDate: fromToday(scenario === 'payday' ? -2 : 24),
        thisCycle: [],
        renewalDate: null
      },
      {
        id: 'prime',
        name: 'Amazon Prime',
        amount: 95,
        category: 'SUBSCRIPTION',
        frequency: 'ANNUALLY',
        type: 'EXPENSE',
        firstPaymentDate: fromToday(-93),
        lastPaymentDate: null,
        nextDueDate: fromToday(272),
        thisCycle: [],
        renewalDate: null
      }
    ],
    oneOffPayments: [
      {
        id: 'shopping',
        name: 'Shopping',
        amount: 10,
        dueDate: fromToday(7),
        type: 'INCOME',
        category: 'OTHER'
      },
      {
        id: 'birthday',
        name: 'Birthday',
        amount: 75,
        dueDate: fromToday(scenario === 'payday' ? -10 : 18),
        type: 'EXPENSE',
        category: 'GIFT'
      }
    ],
    notes: [
      ['Update this note', 'BLUE', 0],
      ['Added a new note', 'GREEN', 1],
      ['Test Note\n\nDo Da Dee', 'AMBER', 2],
      ['New Note', 'VIOLET', 3],
      ['I am a long note\nI am a long note\nI am a long note\nI am a long note', 'ROSE', 4]
    ].map(([body, color, age], index) => {
      const at = String(Date.now() - Number(age) * 3_600_000);
      return {
        id: `note-${index + 1}`,
        body: String(body),
        color: String(color),
        createdAt: at,
        updatedAt: at
      };
    })
  };

  if (scenario === 'empty') {
    return { ...account, recurringPayments: [], oneOffPayments: [], notes: [] };
  }
  if (scenario === 'debts') {
    return { ...account, recurringPayments: [...account.recurringPayments, ...demoDebts()] };
  }
  if (scenario === 'reminders') {
    return {
      ...account,
      recurringPayments: [...account.recurringPayments, ...demoReminderPayments()],
      notes: [...demoDatedNotes(), ...account.notes]
    };
  }
  return account;
};

const demoPayment = (fields: {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency?: string;
  dueInDays: number;
  renewInDays?: number;
}) => ({
  id: fields.id,
  name: fields.name,
  amount: fields.amount,
  category: fields.category,
  frequency: fields.frequency ?? 'MONTHLY',
  type: 'EXPENSE' as const,
  firstPaymentDate: fromToday(fields.dueInDays - 365),
  lastPaymentDate: null,
  nextDueDate: fromToday(fields.dueInDays),
  thisCycle: [],
  renewalDate: fields.renewInDays === undefined ? null : fromToday(fields.renewInDays)
});

// Spotify went by unpaid yesterday; car insurance renews in five weeks with a note about it
const demoReminderPayments = () => [
  demoPayment({
    id: 'spotify',
    name: 'Spotify',
    amount: 20,
    category: 'SUBSCRIPTION',
    dueInDays: -1
  }),
  demoPayment({ id: 'energy', name: 'Energy', amount: 120, category: 'UTILITIES', dueInDays: 1 }),
  demoPayment({
    id: 'car-insurance',
    name: 'Car insurance',
    amount: 612,
    category: 'INSURANCE',
    frequency: 'ANNUALLY',
    dueInDays: 36
  }),
  demoPayment({
    id: 'phone',
    name: 'Phone contract',
    amount: 32,
    category: 'UTILITIES',
    dueInDays: 12,
    renewInDays: 109
  })
];

const demoDatedNotes = () =>
  [
    {
      id: 'note-quotes',
      body: 'Car insurance quotes. Get three quotes before renewing.',
      color: 'AMBER',
      date: fromToday(36),
      remind: [30, 7],
      repeat: 'YEARLY' as const,
      payment: 'car-insurance'
    },
    {
      id: 'note-mot',
      body: 'Car MOT and service at the garage on the high street.',
      color: 'BLUE',
      date: fromToday(20),
      remind: [14],
      repeat: 'YEARLY' as const,
      payment: null
    }
  ].map(note => ({ ...note, createdAt: String(Date.now()), updatedAt: String(Date.now()) }));

// Paid monthly, with a balance set from a statement a few weeks ago
interface DemoDebt {
  id: string;
  name: string;
  category: string;
  amount: number;
  dueInDays: number;
  debt: { balance: number; startingBalance: number; apr: number };
  // How many past payments it has, for its history
  paid?: number;
}

const demoDebt = ({ id, name, category, amount, dueInDays, debt, paid = 3 }: DemoDebt) => ({
  id,
  name,
  amount,
  category,
  frequency: 'MONTHLY',
  type: 'EXPENSE' as const,
  firstPaymentDate: fromToday(dueInDays - 365),
  lastPaymentDate: null,
  nextDueDate: fromToday(dueInDays),
  thisCycle: [],
  history: pastPayments({ amount, dueInDays, debt, count: paid }),
  renewalDate: null,
  debt: { ...debt, balanceUpdatedAt: fromToday(-21) }
});

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
    const interest = Math.round(before * (apr / 100 / 12) * 100) / 100;
    const record = {
      ...fakeRecord('PAID', {
        dates: [fromToday(dueInDays - monthsAgo * 30)],
        balanceChange: -amount,
        debt: {
          interest,
          reduction: Math.round((amount - interest) * 100) / 100,
          balanceAfter: Math.round(after * 100) / 100
        }
      }),
      open: false
    };
    after = before;
    return record;
  });
};

const demoDebts = () => [
  demoDebt({
    id: 'credit-card',
    name: 'Credit card',
    category: 'CREDIT_CARD',
    amount: 150,
    dueInDays: 13,
    debt: {
      balance: 2340,
      startingBalance: 3500,
      apr: 24.9
    },
    paid: 18
  }),
  demoDebt({
    id: 'car-finance',
    name: 'Car finance',
    category: 'LOAN',
    amount: 245,
    dueInDays: 24,
    debt: {
      balance: 6860,
      startingBalance: 12000,
      apr: 6.9
    }
  }),
  demoDebt({
    id: 'family-loan',
    name: 'Family loan',
    category: 'LOAN',
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
  const api = createFakeApi({ account: scenario === 'setup' ? null : demoAccount(scenario) });

  useAuthStore.setState({
    session: { token: 'test-token', userId: DEFAULT_USER.id, expiresAt: Date.now() + 86_400_000 },
    endReason: null
  });

  return createApolloClient({ terminatingLink: api.link });
};
