import { Observable } from 'rxjs';
import { ApolloLink } from '@apollo/client';
import {
  buildSchema,
  execute,
  ExecutionResult,
  GraphQLError,
  GraphQLObjectType,
  parse
} from 'graphql';
import { ThemePreference } from '~/graphql/generated';
import { addDays, fromApiDate, startOfToday, toIsoDate } from '~/lib/dates';
import { nextOccurrence, occurrencesBetween, Schedule } from '~/lib/payments';
import { typeDefs } from './schema';

// Shapes as the API returns them: dates are epoch milliseconds in a string

export type FakeRecordKind = 'PAID' | 'SKIPPED' | 'OVERPAYMENT' | 'BALANCE_SET';

// A payment record, as the API keeps them
export interface FakeRecord {
  id: string;
  kind: FakeRecordKind;
  dates: string[];
  balanceChange: number;
  debt: { interest: number; reduction: number; balanceAfter: number } | null;
  open: boolean;
  createdAt: string;
}

export interface FakeDebt {
  balance: number;
  startingBalance: number | null;
  apr: number;
  balanceUpdatedAt: string | null;
}

export interface FakeRecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  type: 'INCOME' | 'EXPENSE';
  firstPaymentDate: string;
  lastPaymentDate: string | null;
  nextDueDate: string | null;
  // Its open pays and skips, oldest first, as the API's thisCycle field
  thisCycle: FakeRecord[];
  // Every record, newest first, as the API's history field
  history?: FakeRecord[];
  renewalDate: string | null;
  renewalReminderDays: number;
  debt?: FakeDebt | null;
}

export interface FakeOneOffPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
  paidAt?: string | null;
}

export interface FakeNote {
  id: string;
  body: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface FakePayday {
  id: string;
  frequency: string;
  type: string;
  dayOfMonth?: number | null;
  weekday?: string | null;
  firstPayDate?: string | null;
  bankHolidayRegion?: string | null;
  overrides?: { for: string; date: string }[];
}

export interface FakeAccount {
  id: string;
  bankBalance: number;
  monthlyIncome: number;
  cycleStartedOn: string | null;
  recurringPayments: FakeRecurringPayment[];
  oneOffPayments: FakeOneOffPayment[];
  notes: FakeNote[];
  payday: FakePayday | null;
}

export interface FakeUser {
  id: string;
  email: string;
  firstName: string;
  surname: string;
  theme: ThemePreference | null;
  accent: string | null;
}

export interface FakeDb {
  user: FakeUser;
  password: string;
  // null means the user has no linked account yet (the app redirects to /setup)
  account: FakeAccount | null;
}

export interface Call {
  operationName: string;
  variables: Record<string, unknown>;
}

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

const schema = buildSchema(typeDefs);

// As the API: a debt's paidOffThisCycle comes from its payment's open pays and overpayments
const debtField = (schema.getType('RecurringPayment') as GraphQLObjectType).getFields().debt;
debtField.resolve = (payment: FakeRecurringPayment) =>
  payment.debt && {
    ...payment.debt,
    paidOffThisCycle: roundPence(
      (payment.history ?? [])
        .filter(record => record.open && (record.kind === 'PAID' || record.kind === 'OVERPAYMENT'))
        .reduce((sum, record) => sum + (record.debt?.reduction ?? 0), 0)
    )
  };

export const DEFAULT_USER: FakeUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  surname: 'Account',
  theme: null,
  accent: null
};

export const DEFAULT_PASSWORD = 'password1';

// The token in a reset link that the fake API accepts, once
export const VALID_RESET_TOKEN = 'valid-reset-token';

/* 'YYYY-MM-DD' -> the API's date: midnight UTC as epoch milliseconds */
export const apiDate = (iso: string) => String(Date.parse(`${iso}T00:00:00Z`));

/* A date some days from today, in the API's format, for data that has to be current */
export const apiDateFromToday = (days: number) => apiDate(toIsoDate(addDays(startOfToday(), days)));

// The API stores whatever a YYYY-MM-DD input says as that day
const fromInput = (value: string) => apiDate(value.slice(0, 10));

const toApi = (date: Date | null) => (date ? apiDate(toIsoDate(date)) : null);

const scheduleOf = (
  payment: Pick<FakeRecurringPayment, 'firstPaymentDate' | 'frequency' | 'lastPaymentDate'>
): Schedule => ({
  firstPaymentDate: fromApiDate(payment.firstPaymentDate)!,
  frequency: payment.frequency as never,
  lastPaymentDate: fromApiDate(payment.lastPaymentDate)
});

// Works out a recurring payment's due date the way the API's model does
const dueDateFor = (
  payment: Pick<FakeRecurringPayment, 'firstPaymentDate' | 'frequency' | 'lastPaymentDate'>
) => toApi(nextOccurrence(scheduleOf(payment), startOfToday()));

let recordCount = 0;

/* A payment record for tests to put on a payment's thisCycle: open, from this cycle */
export const fakeRecord = (
  kind: FakeRecordKind,
  {
    dates,
    balanceChange = 0,
    debt = null
  }: { dates: string[]; balanceChange?: number; debt?: FakeRecord['debt'] }
): FakeRecord => ({
  id: `record-${++recordCount}`,
  kind,
  dates,
  balanceChange,
  debt,
  open: true,
  createdAt: String(Date.now())
});

const PAYMENTS_PER_YEAR: Record<string, number> = {
  WEEKLY: 52,
  BIWEEKLY: 26,
  MONTHLY: 12,
  QUARTERLY: 4,
  ANNUALLY: 1
};

// As the API: a record goes on the payment's history, and its pays and skips on thisCycle
const addRecord = (payment: FakeRecurringPayment, record: FakeRecord) => {
  payment.history = [record, ...(payment.history ?? [])];
  if (record.kind === 'PAID' || record.kind === 'SKIPPED') payment.thisCycle.push(record);
};

const removeRecord = (payment: FakeRecurringPayment, record: FakeRecord) => {
  payment.history = (payment.history ?? []).filter(item => item.id !== record.id);
  payment.thisCycle = payment.thisCycle.filter(item => item.id !== record.id);
};

// As the API: records dates as paid or skipped and moves the payment on to the date after the last
const handle = (
  payment: FakeRecurringPayment,
  {
    kind,
    dates,
    balanceChange = 0,
    debt = null
  }: {
    kind: 'PAID' | 'SKIPPED';
    dates: Date[];
    balanceChange?: number;
    debt?: FakeRecord['debt'];
  }
) => {
  if (!dates.length) return;
  addRecord(
    payment,
    fakeRecord(kind, { dates: dates.map(date => toApi(date)!), balanceChange, debt })
  );
  payment.nextDueDate = toApi(nextOccurrence(scheduleOf(payment), addDays(dates.at(-1)!, 1)));
};

// As the API: the period's interest goes on, then the payment comes off, never below nothing
const payTowardsDebt = (
  debt: FakeDebt,
  { amount, frequency }: { amount: number; frequency: string }
) => {
  const interest = roundPence((debt.balance * debt.apr) / 100 / PAYMENTS_PER_YEAR[frequency]);
  const balance = Math.max(0, roundPence(debt.balance + interest - amount));
  return { interest, reduction: roundPence(debt.balance - balance), balanceAfter: balance };
};

export const DEFAULT_ACCOUNT: FakeAccount = {
  id: 'account-1',
  bankBalance: 1000,
  monthlyIncome: 2500,
  // Started today, so the payday prompt doesn't show unless a test asks for it
  cycleStartedOn: apiDateFromToday(0),
  recurringPayments: [
    {
      id: 'recurring-1',
      name: 'Mortgage',
      amount: 750,
      category: 'MORTGAGE',
      frequency: 'MONTHLY',
      type: 'EXPENSE',
      firstPaymentDate: apiDate('2026-01-28'),
      lastPaymentDate: null,
      // Worked out by the client, as for payments saved before the API tracked due dates
      nextDueDate: null,
      thisCycle: [],
      renewalDate: null,
      renewalReminderDays: 0
    }
  ],
  oneOffPayments: [
    {
      id: 'payment-1',
      name: 'Holiday',
      amount: 200,
      dueDate: apiDate('2099-06-15'),
      type: 'EXPENSE',
      category: 'TRAVEL'
    }
  ],
  notes: [
    {
      id: 'note-1',
      body: 'Buy milk',
      color: 'BLUE',
      createdAt: String(Date.parse('2024-01-01T10:00:00Z')),
      updatedAt: String(Date.parse('2024-01-01T10:00:00Z'))
    }
  ],
  payday: {
    id: 'payday-1',
    frequency: 'MONTHLY',
    type: 'LAST_DAY',
    dayOfMonth: null,
    weekday: null,
    firstPayDate: null,
    bankHolidayRegion: 'ENGLAND_AND_WALES',
    overrides: []
  }
};

const clone = <T>(value: T): T => structuredClone(value);

const apiError = (
  code: string,
  {
    message = code,
    extensions = {}
  }: { message?: string; extensions?: Record<string, unknown> } = {}
) => new GraphQLError(message, { extensions: { code, ...extensions } });

export interface FakeApi {
  link: ApolloLink;
  // Stands in for the browser's fetch, for the session refresh sent outside Apollo
  fetch: typeof fetch;
  db: FakeDb;
  calls: Call[];
  // The signed-in user as the API returns them, with their account's id once setup is finished
  currentUser: () => FakeUser & { account: string | null };
  // Returns the variables of every call to an operation
  callsTo: (operationName: string) => Record<string, unknown>[];
  // Makes the next call to an operation return a GraphQL error with this code
  failNext: (
    operationName: string,
    error: { code: string; message?: string; extensions?: Record<string, unknown> }
  ) => void;
}

interface Options {
  user?: FakeUser;
  password?: string;
  // Pass null to simulate a user without an account
  account?: FakeAccount | null;
}

// Loosely typed resolver args: the schema validates the real shapes before resolvers run
type Args = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// An in-memory GraphQL API behind an ApolloLink. It executes operations with the real graphql
// engine so selection sets, variables and __typename behave like the real server.
export const createFakeApi = ({
  user = DEFAULT_USER,
  password = DEFAULT_PASSWORD,
  account = clone(DEFAULT_ACCOUNT)
}: Options = {}): FakeApi => {
  const db: FakeDb = { user: clone(user), password, account: account ? clone(account) : null };
  const resetTokens = new Set([VALID_RESET_TOKEN]);
  const calls: Call[] = [];
  const failures = new Map<string, GraphQLError>();
  let nextId = 1;
  const newId = (prefix: string) => `${prefix}-new-${nextId++}`;

  const currentUser = () => ({ ...db.user, account: db.account?.id ?? null });

  const authData = () => ({ user: currentUser(), token: 'test-token', tokenExpiration: 1 });

  const checkPassword = (newPassword: string) => {
    if (newPassword.length < 8 || !/[0-9]/.test(newPassword)) {
      throw apiError('INVALID_PASSWORD', {
        message: 'Password must be at least 8 characters and contain a number'
      });
    }
  };

  const requireAccount = () => {
    if (!db.account) throw apiError('ACCOUNT_NOT_LINKED', { message: 'Account not linked' });
    return db.account;
  };

  // Names are unique across an account's payments, as the API enforces
  const checkUniqueName = (name: string, exceptId?: string) => {
    const { recurringPayments, oneOffPayments } = requireAccount();
    const taken = [...recurringPayments, ...oneOffPayments].some(
      payment => payment.name === name && payment.id !== exceptId
    );
    if (taken)
      throw apiError('PAYMENT_EXISTS', { message: `A payment called '${name}' already exists` });
  };

  const findRecurring = (id: string) => {
    const payment = requireAccount().recurringPayments.find(p => p.id === id);
    if (!payment)
      throw apiError('RECURRING_PAYMENT_NOT_FOUND', { message: `No recurring payment '${id}'` });
    return payment;
  };

  const findOneOff = (id: string) => {
    const payment = requireAccount().oneOffPayments.find(p => p.id === id);
    if (!payment) throw apiError('PAYMENT_NOT_FOUND', { message: `No payment '${id}'` });
    return payment;
  };

  const newRecurring = (input: Args): FakeRecurringPayment => {
    const payment = {
      id: newId('recurring'),
      name: input.name,
      amount: input.amount,
      category: input.category,
      frequency: input.frequency,
      type: input.type,
      firstPaymentDate: fromInput(input.firstPaymentDate),
      lastPaymentDate: input.lastPaymentDate ? fromInput(input.lastPaymentDate) : null,
      nextDueDate: null,
      thisCycle: [],
      history: [],
      renewalDate: input.renewalDate ? fromInput(input.renewalDate) : null,
      renewalReminderDays: input.renewalReminderDays ?? 0,
      debt: input.debt ? debtFrom(input.debt) : null
    };
    const created = { ...payment, nextDueDate: dueDateFor(payment) };
    if (created.debt) balanceSet(created, null);
    return created;
  };

  const updateRecurring = (payment: FakeRecurringPayment, input: Args) => {
    if (input.name && input.name !== payment.name) checkUniqueName(input.name, payment.id);
    const scheduleChanged = ['firstPaymentDate', 'frequency'].some(key => key in input);
    const endChanged = 'lastPaymentDate' in input;
    // A debt's balance gets a new date, and a record, only when it's set to something else
    if (input.debt === null) {
      payment.debt = null;
    } else if (input.debt) {
      const previous = payment.debt ? payment.debt.balance : null;
      const moved = previous !== input.debt.balance;
      payment.debt = moved
        ? debtFrom(input.debt)
        : { ...debtFrom(input.debt), balanceUpdatedAt: payment.debt?.balanceUpdatedAt ?? null };
      if (moved) balanceSet(payment, previous);
    }
    for (const [key, value] of Object.entries(input)) {
      if (value === undefined || key === 'debt') continue;
      const isDate = ['firstPaymentDate', 'lastPaymentDate', 'renewalDate'].includes(key);
      Object.assign(payment, { [key]: isDate && value ? fromInput(value) : value });
    }
    // A new schedule starts again from its next date, with nothing paid or skipped: the old
    // schedule's records are closed
    if (scheduleChanged) {
      payment.nextDueDate = dueDateFor(payment);
      for (const record of payment.history ?? []) record.open = false;
      payment.thisCycle = [];
    } else if (endChanged) {
      // Only the end moved: carry on from the date still due, or after the latest one dealt with
      const latest = fromApiDate(payment.thisCycle.at(-1)?.dates.at(-1));
      const from =
        fromApiDate(payment.nextDueDate) ?? (latest ? addDays(latest, 1) : startOfToday());
      payment.nextDueDate = toApi(nextOccurrence(scheduleOf(payment), from));
    }
    return payment;
  };

  const newOneOff = (input: Args): FakeOneOffPayment => ({
    id: newId('payment'),
    name: input.name,
    amount: input.amount,
    dueDate: fromInput(input.dueDate),
    type: input.type,
    category: input.category,
    paidAt: null
  });

  const debtFrom = (input: Args): FakeDebt => ({
    balance: input.balance,
    startingBalance: input.startingBalance ?? null,
    apr: input.apr,
    balanceUpdatedAt: String(Date.now())
  });

  // As the API: notes a debt's balance being set by hand, and how far it moved
  const balanceSet = (payment: FakeRecurringPayment, previous: number | null) => {
    const balance = payment.debt?.balance ?? 0;
    addRecord(payment, {
      ...fakeRecord('BALANCE_SET', { dates: [apiDateFromToday(0)] }),
      debt: {
        interest: 0,
        reduction: roundPence((previous ?? balance) - balance),
        balanceAfter: balance
      }
    });
  };

  // As the API's records for paid one-offs: what paying took off, to put back on undo
  const oneOffPaid = new Map<string, number>();

  const rootValue = {
    tokenFindUser: currentUser,
    // With no id, the signed-in user's account
    account: ({ id }: Args) => {
      const current = requireAccount();
      if (id && id !== current.id)
        throw apiError('ACCOUNT_NOT_FOUND', { message: `No account '${id}'` });
      return current;
    },
    recurringPayment: ({ id }: Args) => {
      const payment = findRecurring(id);
      // As the API: the latest `limit` records, 50 when it isn't given
      return {
        ...payment,
        history: ({ limit }: Args) => (payment.history ?? []).slice(0, limit ?? 50)
      };
    },
    // Messages and codes as the real API sends them
    // The refresh cookie is always good here
    refreshSession: authData,
    login: ({ email, password: attempt }: Args) => {
      if (email !== db.user.email) {
        throw apiError('USER_EMAIL_NOT_FOUND', {
          message: "We couldn't find a user with that email address"
        });
      }
      if (attempt !== db.password)
        throw apiError('INVALID_CREDENTIALS', { message: 'Password is incorrect' });
      return authData();
    },
    // Replaces the fake's one user with the new one, who has no account until setup
    registerAndLogin: ({ input }: Args) => {
      if (input.email === db.user.email) {
        throw apiError('USER_EXISTS', {
          message: 'Account with that email address already exists'
        });
      }
      checkPassword(input.password);
      db.user = {
        id: 'user-new',
        email: input.email,
        firstName: input.firstName,
        surname: input.surname,
        theme: null,
        accent: null
      };
      db.password = input.password;
      db.account = null;
      return authData();
    },
    requestPasswordReset: () => ({ success: true }),
    passwordResetTokenValid: ({ token }: Args) => ({
      valid: resetTokens.has(token),
      email: resetTokens.has(token) ? db.user.email : null
    }),
    logout: () => ({ success: true }),
    logoutEverywhere: () => ({ success: true }),
    updatePreferences: ({ theme, accent }: Args) => {
      db.user = { ...db.user, theme: theme ?? db.user.theme, accent: accent ?? db.user.accent };
      return { user: currentUser(), success: true };
    },
    resetPassword: ({ token, password: newPassword }: Args) => {
      if (!resetTokens.has(token)) {
        throw apiError('PASSWORD_RESET_TOKEN_INVALID', {
          message: 'This password reset link is invalid or has expired'
        });
      }
      checkPassword(newPassword);
      resetTokens.delete(token);
      db.password = newPassword;
      return authData();
    },
    updateCurrentUser: ({ input }: Args) => {
      db.user = {
        ...db.user,
        firstName: input.firstName.trim(),
        surname: input.surname.trim(),
        email: input.email.trim()
      };
      return { user: currentUser(), success: true };
    },
    changePassword: ({ currentPassword, newPassword }: Args) => {
      if (currentPassword !== db.password) {
        throw apiError('INVALID_CREDENTIALS', { message: 'Password is incorrect' });
      }
      checkPassword(newPassword);
      db.password = newPassword;
      return { user: currentUser(), success: true };
    },
    deleteCurrentUser: () => {
      db.account = null;
      return { success: true };
    },

    createAccount: ({ input }: Args) => {
      if (db.account) throw apiError('ACCOUNT_EXISTS', { message: 'Account already exists' });
      db.account = {
        id: 'account-new',
        bankBalance: input.bankBalance,
        monthlyIncome: input.monthlyIncome,
        cycleStartedOn: apiDateFromToday(0),
        recurringPayments: [],
        oneOffPayments: [],
        notes: [],
        payday: input.payday
          ? {
              id: 'payday-new',
              ...input.payday,
              overrides: [],
              firstPayDate: input.payday.firstPayDate ? fromInput(input.payday.firstPayDate) : null
            }
          : null
      };
      db.account.recurringPayments = (input.recurringPayments ?? []).map(newRecurring);
      db.account.oneOffPayments = (input.oneOffPayments ?? []).map(newOneOff);
      return { account: db.account, success: true };
    },
    updateAccount: ({ input }: Args) => {
      const current = requireAccount();
      if (input.bankBalance !== undefined) current.bankBalance = input.bankBalance;
      if (input.monthlyIncome !== undefined) current.monthlyIncome = input.monthlyIncome;
      return { account: current, success: true };
    },
    // As the API: closes the records of the cycle that ended, clears away paid one-offs due before
    // payday, and moves the chosen payments on from dates left over to their first date from payday
    startPaydayCycle: ({ input }: Args) => {
      const current = requireAccount();
      const cycleStart = fromApiDate(fromInput(input.payday))!;
      input.recurringPaymentIds.forEach(findRecurring);
      const inNewCycle = (record: FakeRecord) =>
        record.dates.some(date => fromApiDate(date)! >= cycleStart);
      current.oneOffPayments = current.oneOffPayments.filter(
        payment => !payment.paidAt || fromApiDate(payment.dueDate)! >= cycleStart
      );
      for (const payment of current.recurringPayments) {
        for (const record of payment.history ?? []) if (!inNewCycle(record)) record.open = false;
        payment.thisCycle = payment.thisCycle.filter(inNewCycle);
        const due = fromApiDate(payment.nextDueDate);
        if (input.recurringPaymentIds.includes(payment.id) && due && due < cycleStart) {
          payment.nextDueDate = toApi(nextOccurrence(scheduleOf(payment), cycleStart));
        }
      }
      current.bankBalance = input.bankBalance;
      current.cycleStartedOn = fromInput(input.payday);
      return { account: current, success: true };
    },
    // As the API: paid payments come off the balance (income goes on), with a debt's interest
    // added first. One-offs are marked paid until payday.
    markPaymentsPaid: ({ input }: Args) => {
      const current = requireAccount();
      const change = (p: { amount: number; type: string }) =>
        p.type === 'INCOME' ? p.amount : -p.amount;
      for (const id of input.recurringPaymentIds) {
        const payment = findRecurring(id);
        if (!payment.nextDueDate) continue;
        let debt: FakeRecord['debt'] = null;
        if (payment.debt) {
          debt = payTowardsDebt(payment.debt, {
            amount: payment.amount,
            frequency: payment.frequency
          });
          payment.debt.balance = debt.balanceAfter;
        }
        current.bankBalance += change(payment);
        handle(payment, {
          kind: 'PAID',
          dates: [fromApiDate(payment.nextDueDate)!],
          balanceChange: change(payment),
          debt
        });
      }
      for (const id of input.oneOffPaymentIds) {
        const payment = findOneOff(id);
        if (payment.paidAt) continue;
        current.bankBalance += change(payment);
        oneOffPaid.set(id, change(payment));
        payment.paidAt = String(Date.now());
      }
      current.bankBalance = roundPence(current.bankBalance);
      return { account: current, success: true };
    },
    // As the API: undoes the latest pay or skip this cycle, bringing its dates back, and makes
    // paid one-offs unpaid, putting back exactly what paying did
    markPaymentsUnpaid: ({ input }: Args) => {
      const current = requireAccount();
      for (const id of input.recurringPaymentIds) {
        const payment = findRecurring(id);
        const latest = payment.thisCycle.at(-1);
        if (!latest) continue;
        removeRecord(payment, latest);
        payment.nextDueDate = latest.dates[0];
        current.bankBalance -= latest.balanceChange;
        if (payment.debt && latest.debt) {
          payment.debt.balance = roundPence(payment.debt.balance + latest.debt.reduction);
        }
      }
      for (const id of input.oneOffPaymentIds ?? []) {
        const payment = findOneOff(id);
        if (!payment.paidAt) continue;
        current.bankBalance -=
          oneOffPaid.get(id) ?? (payment.type === 'INCOME' ? payment.amount : -payment.amount);
        oneOffPaid.delete(id);
        payment.paidAt = null;
      }
      current.bankBalance = roundPence(current.bankBalance);
      return { account: current, success: true };
    },
    // As the API: extra off a debt and off the bank balance
    logDebtOverpayment: ({ input }: Args) => {
      const current = requireAccount();
      const payment = findRecurring(input.recurringPaymentId);
      if (!payment.debt)
        throw apiError('DEBT_NOT_TRACKED', { message: "That payment isn't tracked as a debt" });
      if (input.amount <= 0) {
        throw apiError('BAD_USER_INPUT', {
          message: 'Overpayments must be more than £0',
          extensions: { field: 'amount' }
        });
      }
      if (input.amount > payment.debt.balance) {
        throw apiError('BAD_USER_INPUT', {
          message: "That's more than is left to pay",
          extensions: { field: 'amount' }
        });
      }
      payment.debt.balance = roundPence(payment.debt.balance - input.amount);
      current.bankBalance = roundPence(current.bankBalance - input.amount);
      addRecord(
        payment,
        fakeRecord('OVERPAYMENT', {
          dates: [apiDateFromToday(0)],
          balanceChange: -input.amount,
          debt: {
            interest: 0,
            reduction: input.amount,
            balanceAfter: payment.debt.balance
          }
        })
      );
      return { account: current, success: true };
    },
    undoDebtOverpayment: ({ input }: Args) => {
      const current = requireAccount();
      for (const payment of current.recurringPayments) {
        const record = (payment.history ?? []).find(item => item.id === input.recordId);
        if (!record || record.kind !== 'OVERPAYMENT') continue;
        if (!record.open)
          throw apiError('PAYMENT_RECORD_CLOSED', { message: "It's from before the last payday" });
        removeRecord(payment, record);
        current.bankBalance = roundPence(current.bankBalance - record.balanceChange);
        if (payment.debt && record.debt) {
          payment.debt.balance = roundPence(payment.debt.balance + record.debt.reduction);
        }
        return { account: current, success: true };
      }
      throw apiError('PAYMENT_RECORD_NOT_FOUND', {
        message: `No payment record '${input.recordId}'`
      });
    },
    // Skips the next date, or every date before `until`, without touching the balance
    skipRecurringPayments: ({ input }: Args) => {
      const current = requireAccount();
      for (const id of input.recurringPaymentIds) {
        const payment = findRecurring(id);
        const next = fromApiDate(payment.nextDueDate);
        if (!next) continue;
        const dates = input.until
          ? occurrencesBetween(scheduleOf(payment), {
              from: next,
              to: addDays(fromApiDate(fromInput(input.until))!, -1)
            })
          : [next];
        handle(payment, { kind: 'SKIPPED', dates });
      }
      return { account: current, success: true };
    },
    updatePayday: ({ input }: Args) => {
      const current = requireAccount();
      current.payday = {
        id: current.payday?.id ?? 'payday-new',
        ...input,
        firstPayDate: input.firstPayDate ? fromInput(input.firstPayDate) : null,
        overrides: current.payday?.overrides ?? []
      };
      return { payday: current.payday, success: true };
    },
    setPaydayOverride: ({ for: usual, date }: Args) => {
      const current = requireAccount();
      const rest = (current.payday?.overrides ?? []).filter(item => item.for !== usual);
      current.payday = {
        ...current.payday!,
        overrides: date ? [...rest, { for: usual, date }] : rest
      };
      return { payday: current.payday, success: true };
    },

    createRecurringPayment: ({ input }: Args) => {
      checkUniqueName(input.name);
      const payment = newRecurring(input);
      requireAccount().recurringPayments.push(payment);
      return { recurringPayment: payment, success: true };
    },
    updateRecurringPayment: ({ id, input }: Args) => ({
      recurringPayment: updateRecurring(findRecurring(id), input),
      success: true
    }),
    batchDeleteRecurringPayments: ({ ids }: Args) => {
      const current = requireAccount();
      ids.forEach(findRecurring);
      current.recurringPayments = current.recurringPayments.filter(p => !ids.includes(p.id));
      return { success: true, deletedCount: ids.length, ids };
    },

    createOneOffPayment: ({ input }: Args) => {
      checkUniqueName(input.name);
      const payment = newOneOff(input);
      requireAccount().oneOffPayments.push(payment);
      return { oneOffPayment: payment, success: true };
    },
    updateOneOffPayment: ({ id, input }: Args) => {
      const payment = findOneOff(id);
      if (input.name && input.name !== payment.name) checkUniqueName(input.name, id);
      Object.assign(payment, {
        ...input,
        ...(input.dueDate ? { dueDate: fromInput(input.dueDate) } : {})
      });
      return { oneOffPayment: payment, success: true };
    },
    batchDeleteOneOffPayments: ({ ids }: Args) => {
      const current = requireAccount();
      ids.forEach(findOneOff);
      current.oneOffPayments = current.oneOffPayments.filter(p => !ids.includes(p.id));
      return { success: true, deletedCount: ids.length, ids };
    },

    createNote: ({ input }: Args) => {
      const current = requireAccount();
      if (current.notes.some(note => note.body === input.body)) {
        throw apiError('NOTE_EXISTS', { message: 'A note with that text already exists' });
      }
      const now = String(Date.now());
      const note = {
        id: newId('note'),
        body: input.body,
        color: input.color ?? 'BLUE',
        createdAt: now,
        updatedAt: now
      };
      current.notes.push(note);
      return { note, success: true };
    },
    updateNote: ({ id, input }: Args) => {
      const note = requireAccount().notes.find(n => n.id === id);
      if (!note) throw apiError('NOTE_NOT_FOUND', { message: `No note '${id}'` });
      Object.assign(note, input, { updatedAt: String(Date.now()) });
      return { note, success: true };
    },
    deleteNote: ({ id }: Args) => {
      const current = requireAccount();
      const deleted = current.notes.some(note => note.id === id);
      current.notes = current.notes.filter(note => note.id !== id);
      return { success: true, deletedCount: deleted ? 1 : 0, ids: deleted ? [id] : [] };
    }
  };

  const link = new ApolloLink(operation => {
    const operationName = operation.operationName ?? '';
    calls.push({ operationName, variables: clone(operation.variables) });

    return new Observable(subscriber => {
      const failure = failures.get(operationName);
      if (failure) {
        failures.delete(operationName);
        subscriber.next({ data: null, errors: [failure.toJSON()] });
        subscriber.complete();
        return;
      }

      Promise.resolve(
        execute({
          schema,
          document: operation.query,
          rootValue,
          variableValues: operation.variables,
          operationName
        })
      ).then(
        result => {
          // Snapshot the result so later changes to the db can't alter cached responses
          // JSON round trip (not structuredClone) so GraphQL errors keep their extensions
          subscriber.next(JSON.parse(JSON.stringify(result)) as ExecutionResult);
          subscriber.complete();
        },
        error => subscriber.error(error)
      );
    });
  });

  const fakeFetch = async (_url: RequestInfo | URL, init?: RequestInit) => {
    const { query, variables } = JSON.parse(String(init?.body));
    const document = parse(query);
    const result = await execute({ schema, document, rootValue, variableValues: variables });
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  };

  return {
    link,
    fetch: fakeFetch,
    db,
    calls,
    currentUser,
    callsTo: name => calls.filter(c => c.operationName === name).map(c => c.variables),
    failNext: (operationName, { code, ...error }) => {
      failures.set(operationName, apiError(code, error));
    }
  };
};
