import { Observable } from 'rxjs';
import { ApolloLink } from '@apollo/client';
import { buildSchema, execute, ExecutionResult, GraphQLError } from 'graphql';
import { addDays, fromApiDate, startOfToday, toIsoDate } from '~/lib/dates';
import { nextOccurrence } from '~/lib/payments';
import { typeDefs } from './schema';

// Shapes as the API returns them: dates are epoch milliseconds in a string

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
  status: 'UNPAID' | 'PAID' | 'SKIPPED';
}

export interface FakeOneOffPayment {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
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

const schema = buildSchema(typeDefs);

export const DEFAULT_USER: FakeUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  surname: 'Account'
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

// Works out a recurring payment's due date the way the API's model does
const dueDateFor = (
  payment: Pick<FakeRecurringPayment, 'firstPaymentDate' | 'frequency' | 'lastPaymentDate'>
) => {
  const due = nextOccurrence(
    {
      firstPaymentDate: fromApiDate(payment.firstPaymentDate)!,
      frequency: payment.frequency as never,
      lastPaymentDate: fromApiDate(payment.lastPaymentDate)
    },
    startOfToday()
  );
  return due ? apiDate(toIsoDate(due)) : null;
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
      status: 'UNPAID'
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
    bankHolidayRegion: 'ENGLAND_AND_WALES'
  }
};

const clone = <T>(value: T): T => structuredClone(value);

const apiError = (code: string, message = code, extensions: Record<string, unknown> = {}) =>
  new GraphQLError(message, { extensions: { code, ...extensions } });

export interface FakeApi {
  link: ApolloLink;
  db: FakeDb;
  calls: Call[];
  // Returns the variables of every call to an operation
  callsTo: (operationName: string) => Record<string, unknown>[];
  // Makes the next call to an operation return a GraphQL error with this code
  failNext: (
    operationName: string,
    code: string,
    options?: { message?: string; extensions?: Record<string, unknown> }
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

  const authData = () => ({ user: db.user, token: 'test-token', tokenExpiration: 1 });

  const checkPassword = (newPassword: string) => {
    if (newPassword.length < 8 || !/[0-9]/.test(newPassword)) {
      throw apiError(
        'INVALID_PASSWORD',
        'Password must be at least 8 characters and contain a number'
      );
    }
  };

  const requireAccount = () => {
    if (!db.account) throw apiError('ACCOUNT_NOT_LINKED', 'Account not linked');
    return db.account;
  };

  // Names are unique across an account's payments, as the API enforces
  const checkUniqueName = (name: string, exceptId?: string) => {
    const { recurringPayments, oneOffPayments } = requireAccount();
    const taken = [...recurringPayments, ...oneOffPayments].some(
      payment => payment.name === name && payment.id !== exceptId
    );
    if (taken) throw apiError('PAYMENT_EXISTS', `A payment called '${name}' already exists`);
  };

  const findRecurring = (id: string) => {
    const payment = requireAccount().recurringPayments.find(p => p.id === id);
    if (!payment) throw apiError('RECURRING_PAYMENT_NOT_FOUND', `No recurring payment '${id}'`);
    return payment;
  };

  const findOneOff = (id: string) => {
    const payment = requireAccount().oneOffPayments.find(p => p.id === id);
    if (!payment) throw apiError('PAYMENT_NOT_FOUND', `No payment '${id}'`);
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
      status: 'UNPAID' as const
    };
    return { ...payment, nextDueDate: dueDateFor(payment) };
  };

  const updateRecurring = (payment: FakeRecurringPayment, input: Args) => {
    if (input.name && input.name !== payment.name) checkUniqueName(input.name, payment.id);
    const scheduleChanged = ['firstPaymentDate', 'frequency', 'lastPaymentDate'].some(
      key => key in input
    );
    for (const [key, value] of Object.entries(input)) {
      if (key === 'id' || value === undefined) continue;
      const isDate = key === 'firstPaymentDate' || key === 'lastPaymentDate';
      Object.assign(payment, { [key]: isDate && value ? fromInput(value) : value });
    }
    if (scheduleChanged) {
      payment.nextDueDate = dueDateFor(payment);
      if (!('status' in input)) payment.status = 'UNPAID';
    }
    return payment;
  };

  const newOneOff = (input: Args): FakeOneOffPayment => ({
    id: newId('payment'),
    name: input.name,
    amount: input.amount,
    dueDate: fromInput(input.dueDate),
    type: input.type,
    category: input.category
  });

  const rootValue = {
    tokenFindUser: () => db.user,
    account: () => requireAccount(),
    // Messages and codes as the real API sends them
    login: ({ email, password: attempt }: Args) => {
      if (email !== db.user.email) {
        throw apiError('USER_EMAIL_NOT_FOUND', "We couldn't find a user with that email address");
      }
      if (attempt !== db.password) throw apiError('INVALID_CREDENTIALS', 'Password is incorrect');
      return authData();
    },
    // Replaces the fake's one user with the new one, who has no account until setup
    registerAndLogin: ({ user: input }: Args) => {
      if (input.email === db.user.email) {
        throw apiError('USER_EXISTS', 'Account with that email address already exists');
      }
      checkPassword(input.password);
      db.user = {
        id: 'user-new',
        email: input.email,
        firstName: input.firstName,
        surname: input.surname
      };
      db.password = input.password;
      db.account = null;
      return authData();
    },
    requestPasswordReset: () => ({ success: true }),
    passwordResetTokenValid: ({ token }: Args) => resetTokens.has(token),
    resetPassword: ({ token, password: newPassword }: Args) => {
      if (!resetTokens.has(token)) {
        throw apiError(
          'PASSWORD_RESET_TOKEN_INVALID',
          'This password reset link is invalid or has expired'
        );
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
      return { user: db.user, success: true };
    },
    changePassword: ({ currentPassword, newPassword }: Args) => {
      if (currentPassword !== db.password) {
        throw apiError('INVALID_CREDENTIALS', 'Password is incorrect');
      }
      checkPassword(newPassword);
      db.password = newPassword;
      return { user: db.user, success: true };
    },
    deleteCurrentUser: () => {
      db.account = null;
      return { success: true };
    },

    createAccount: ({ account: input }: Args) => {
      if (db.account) throw apiError('ACCOUNT_EXISTS', 'Account already exists');
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
              firstPayDate: input.payday.firstPayDate ? fromInput(input.payday.firstPayDate) : null
            }
          : null
      };
      db.account.recurringPayments = (input.recurringPayments ?? []).map(newRecurring);
      db.account.oneOffPayments = (input.oneOffPayments ?? []).map(newOneOff);
      return { account: db.account, success: true };
    },
    editAccount: ({ account: input }: Args) => {
      const current = requireAccount();
      if (input.bankBalance !== undefined) current.bankBalance = input.bankBalance;
      if (input.monthlyIncome !== undefined) current.monthlyIncome = input.monthlyIncome;
      return { account: current, success: true };
    },
    startPaydayCycle: ({ input }: Args) => {
      const current = requireAccount();
      const today = startOfToday();
      for (const id of input.recurringPaymentIds) {
        const payment = findRecurring(id);
        const due = fromApiDate(payment.nextDueDate);
        const after = due ? addDays(due, 1) : today;
        const next = nextOccurrence(
          {
            firstPaymentDate: fromApiDate(payment.firstPaymentDate)!,
            frequency: payment.frequency as never,
            lastPaymentDate: fromApiDate(payment.lastPaymentDate)
          },
          after > today ? after : today
        );
        payment.nextDueDate = next ? apiDate(toIsoDate(next)) : null;
        payment.status = 'UNPAID';
      }
      current.bankBalance = input.bankBalance;
      current.cycleStartedOn = fromInput(input.payday);
      return { account: current, success: true };
    },
    // As the API: paid payments come off the balance (income goes on); one-offs are deleted
    markPaymentsPaid: ({ input }: Args) => {
      const current = requireAccount();
      const change = (p: { amount: number; type: string }) =>
        p.type === 'INCOME' ? p.amount : -p.amount;
      for (const id of input.recurringPaymentIds) {
        const payment = findRecurring(id);
        if (payment.status === 'PAID') continue;
        current.bankBalance += change(payment);
        payment.status = 'PAID';
      }
      for (const id of input.oneOffPaymentIds) current.bankBalance += change(findOneOff(id));
      current.oneOffPayments = current.oneOffPayments.filter(
        p => !input.oneOffPaymentIds.includes(p.id)
      );
      current.bankBalance = Math.round(current.bankBalance * 100) / 100;
      return { account: current, success: true };
    },
    markPaymentsUnpaid: ({ input }: Args) => {
      const current = requireAccount();
      for (const id of input.recurringPaymentIds) {
        const payment = findRecurring(id);
        if (payment.status !== 'PAID') continue;
        current.bankBalance += payment.type === 'INCOME' ? -payment.amount : payment.amount;
        payment.status = 'UNPAID';
      }
      current.bankBalance = Math.round(current.bankBalance * 100) / 100;
      return { account: current, success: true };
    },
    editPayday: ({ payday: input }: Args) => {
      const current = requireAccount();
      current.payday = {
        id: current.payday?.id ?? 'payday-new',
        ...input,
        firstPayDate: input.firstPayDate ? fromInput(input.firstPayDate) : null
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
    batchUpdateRecurringPayments: ({ input }: Args) => ({
      recurringPayments: input.map((update: Args) =>
        updateRecurring(findRecurring(update.id), update)
      ),
      success: true
    }),
    batchDeleteRecurringPayments: ({ ids }: Args) => {
      const current = requireAccount();
      ids.forEach(findRecurring);
      current.recurringPayments = current.recurringPayments.filter(p => !ids.includes(p.id));
      return { success: true, deletedCount: ids.length };
    },

    createOneOffPayment: ({ oneOffPayment: input }: Args) => {
      checkUniqueName(input.name);
      const payment = newOneOff(input);
      requireAccount().oneOffPayments.push(payment);
      return { oneOffPayment: payment, success: true };
    },
    editOneOffPayment: ({ id, oneOffPayment: input }: Args) => {
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
      return { oneOffPayments: [], success: true, deletedCount: ids.length };
    },

    createNote: ({ note: input }: Args) => {
      const current = requireAccount();
      if (current.notes.some(note => note.body === input.body)) {
        throw apiError('NOTE_EXISTS', 'A note with that text already exists');
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
    editNote: ({ id, note: input }: Args) => {
      const note = requireAccount().notes.find(n => n.id === id);
      if (!note) throw apiError('NOTE_NOT_FOUND', `No note '${id}'`);
      Object.assign(note, input, { updatedAt: String(Date.now()) });
      return { note, success: true };
    },
    deleteNote: ({ id }: Args) => {
      const current = requireAccount();
      current.notes = current.notes.filter(note => note.id !== id);
      return { success: true };
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

  return {
    link,
    db,
    calls,
    callsTo: name => calls.filter(c => c.operationName === name).map(c => c.variables),
    failNext: (operationName, code, { message, extensions } = {}) => {
      failures.set(operationName, apiError(code, message, extensions));
    }
  };
};
