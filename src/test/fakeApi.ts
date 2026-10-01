import { Observable } from 'rxjs';
import { ApolloLink } from '@apollo/client';
import { GraphQLError, buildSchema, execute, ExecutionResult } from 'graphql';
import { typeDefs } from './schema';

export interface FakeBill {
  id: string;
  name: string;
  amount: number;
  paid: boolean;
}

export interface FakePayment {
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
  createdAt: string;
  updatedAt: string;
}

export interface FakePayday {
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
  bills: FakeBill[];
  oneOffPayments: FakePayment[];
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
  // null means the user has no linked account yet (the app redirects to /setup)
  account: FakeAccount | null;
}

export interface Call {
  operationName: string;
  variables: Record<string, unknown>;
}

const schema = buildSchema(typeDefs);

const DEFAULT_USER: FakeUser = {
  id: 'user-1',
  email: 'test@example.com',
  firstName: 'Test',
  surname: 'User'
};

// The real API returns Date fields through a GraphQL String, i.e. epoch milliseconds
export const toApiDate = (iso: string) => String(new Date(iso).getTime());

export const DEFAULT_ACCOUNT: FakeAccount = {
  id: 'account-1',
  bankBalance: 1000,
  monthlyIncome: 2500,
  bills: [
    { id: 'bill-1', name: 'Rent', amount: 800, paid: false },
    { id: 'bill-2', name: 'Internet', amount: 30, paid: true }
  ],
  oneOffPayments: [
    {
      id: 'payment-1',
      name: 'Holiday',
      amount: 200,
      dueDate: toApiDate('2099-06-15'),
      type: 'EXPENSE',
      category: 'TRAVEL'
    }
  ],
  notes: [
    {
      id: 'note-1',
      body: 'Buy milk',
      createdAt: toApiDate('2024-01-01T10:00:00Z'),
      updatedAt: toApiDate('2024-01-01T10:00:00Z')
    },
    {
      id: 'note-2',
      body: 'Call the bank',
      createdAt: toApiDate('2024-02-01T10:00:00Z'),
      updatedAt: toApiDate('2024-02-01T10:00:00Z')
    }
  ],
  payday: {
    frequency: 'MONTHLY',
    type: 'LAST_DAY',
    dayOfMonth: null,
    weekday: null,
    firstPayDate: null,
    bankHolidayRegion: 'ENGLAND_AND_WALES'
  }
};

const clone = <T>(value: T): T => structuredClone(value);

export interface FakeApi {
  link: ApolloLink;
  db: FakeDb;
  calls: Call[];
  // Returns the variables of every call to an operation
  callsTo: (operationName: string) => Record<string, unknown>[];
  // Makes the next call to an operation return a GraphQL error with this code
  failNext: (operationName: string, code: string, message?: string) => void;
}

interface Options {
  user?: FakeUser;
  // Pass null to simulate a user without an account
  account?: FakeAccount | null;
}

// Loosely typed resolver args: the schema validates the real shapes before resolvers run
type Args = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

// An in-memory GraphQL API behind an ApolloLink. It executes operations with the real graphql
// engine so selection sets, variables and __typename behave like the real server.
export const createFakeApi = ({
  user = DEFAULT_USER,
  account = clone(DEFAULT_ACCOUNT)
}: Options = {}): FakeApi => {
  const db: FakeDb = { user: clone(user), account: account ? clone(account) : null };
  const calls: Call[] = [];
  const failures = new Map<string, GraphQLError>();
  let nextId = 100;
  const newId = (prefix: string) => `${prefix}-${nextId++}`;

  const requireAccount = () => {
    if (!db.account) {
      throw new GraphQLError('Account not linked', { extensions: { code: 'ACCOUNT_NOT_LINKED' } });
    }
    return db.account;
  };

  const now = () => String(Date.now());

  const rootValue = {
    // ---- queries
    tokenFindUser: () => db.user,
    account: () => requireAccount(),
    login: () => ({ user: db.user, token: 'test-token', tokenExpiration: 1 }),

    // ---- user / account
    registerAndLogin: ({ user: input }: Args) => {
      db.user = { id: 'user-new', ...input } as FakeUser;
      return { user: db.user, token: 'test-token', tokenExpiration: 1 };
    },
    createAccount: ({ account: input }: Args) => {
      db.account = {
        id: 'account-new',
        bankBalance: input.bankBalance,
        monthlyIncome: input.monthlyIncome,
        bills: (input.bills ?? []).map((b: Args) => ({ id: newId('bill'), ...b })),
        oneOffPayments: (input.oneOffPayments ?? []).map((p: Args) => ({
          id: newId('payment'),
          ...p
        })),
        notes: [],
        payday: input.payday ?? null
      };
      return { account: db.account, success: true };
    },
    editAccount: ({ account: input }: Args) => {
      const current = requireAccount();
      if (input.bankBalance !== undefined && input.bankBalance !== null) {
        current.bankBalance = input.bankBalance;
      }
      if (input.monthlyIncome !== undefined && input.monthlyIncome !== null) {
        current.monthlyIncome = input.monthlyIncome;
      }
      return { account: current, success: true };
    },

    // ---- bills
    createBill: ({ bill }: Args) => {
      const created = { id: newId('bill'), ...bill };
      requireAccount().bills.push(created);
      return { bill: created, success: true };
    },
    editBill: ({ id, bill }: Args) => {
      const existing = requireAccount().bills.find(b => b.id === id)!;
      Object.assign(existing, bill);
      return { bill: existing, success: true };
    },
    deleteBill: ({ id }: Args) => {
      const current = requireAccount();
      const existing = current.bills.find(b => b.id === id)!;
      current.bills = current.bills.filter(b => b.id !== id);
      return { bill: existing, success: true };
    },

    // ---- one-off payments
    createOneOffPayment: ({ oneOffPayment }: Args) => {
      const created = { id: newId('payment'), ...oneOffPayment };
      requireAccount().oneOffPayments.push(created);
      return { oneOffPayment: created, success: true };
    },
    editOneOffPayment: ({ id, oneOffPayment }: Args) => {
      const existing = requireAccount().oneOffPayments.find(p => p.id === id)!;
      Object.assign(existing, oneOffPayment);
      return { oneOffPayment: existing, success: true };
    },
    deleteOneOffPayment: ({ id }: Args) => {
      const current = requireAccount();
      const existing = current.oneOffPayments.find(p => p.id === id)!;
      current.oneOffPayments = current.oneOffPayments.filter(p => p.id !== id);
      return { oneOffPayment: existing, success: true };
    },

    // ---- notes
    createNote: ({ note }: Args) => {
      const created = { id: newId('note'), body: note.body, createdAt: now(), updatedAt: now() };
      requireAccount().notes.push(created);
      return { note: created, success: true };
    },
    editNote: ({ id, note }: Args) => {
      const existing = requireAccount().notes.find(n => n.id === id)!;
      existing.body = note.body;
      existing.updatedAt = now();
      return { note: existing, success: true };
    },
    deleteNote: ({ id }: Args) => {
      const current = requireAccount();
      const existing = current.notes.find(n => n.id === id)!;
      current.notes = current.notes.filter(n => n.id !== id);
      return { note: existing, success: true };
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
    failNext: (operationName, code, message = code) => {
      failures.set(operationName, new GraphQLError(message, { extensions: { code } }));
    }
  };
};
