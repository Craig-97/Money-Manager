import { createApolloClient } from '~/graphql/client/createApolloClient';
import { addDays, startOfToday, toIsoDate } from '~/lib/dates';
import { useAuthStore } from '~/state/auth';
import { apiDate, createFakeApi, DEFAULT_USER, FakeAccount } from '~/test/fakeApi';

/*
 * Development only (VITE_MOCK_API=true): the app runs against the in-memory fake API from the
 * tests, already signed in, so pages can be reviewed and screenshotted without the real API or a
 * database. Data resets on every page load. Add ?mock=<scenario> to the URL for other states:
 *   setup    - no account yet, so setup shows
 *   payday   - today is payday, so the payday prompt shows
 *   empty    - an account with no payments or notes
 *   overdrawn - more going out before payday than is in the bank
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
        handled: []
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
        handled: []
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
        handled: []
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
  return account;
};

export const createMockClient = () => {
  const scenario = new URLSearchParams(window.location.search).get('mock');
  const api = createFakeApi({ account: scenario === 'setup' ? null : demoAccount(scenario) });

  useAuthStore.setState({
    session: { token: 'test-token', userId: DEFAULT_USER.id, expiresAt: Date.now() + 86_400_000 },
    endReason: null
  });

  return createApolloClient({ terminatingLink: api.link });
};
