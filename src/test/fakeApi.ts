import { Observable } from 'rxjs';
import { ApolloLink } from '@apollo/client';
import { buildSchema, execute, ExecutionResult, GraphQLError } from 'graphql';
import { typeDefs } from './schema';

export interface FakeRecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: string;
  type: 'INCOME' | 'EXPENSE';
  firstPaymentDate: string;
  lastPaymentDate: string | null;
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
  recurringPayments: FakeRecurringPayment[];
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

// The real API returns Date fields through a GraphQL String, i.e. epoch milliseconds
export const toApiDate = (iso: string) => String(new Date(iso).getTime());

export const DEFAULT_ACCOUNT: FakeAccount = {
  id: 'account-1',
  bankBalance: 1000,
  monthlyIncome: 2500,
  recurringPayments: [
    {
      id: 'recurring-1',
      name: 'Mortgage',
      amount: 750,
      category: 'MORTGAGE',
      frequency: 'MONTHLY',
      type: 'EXPENSE',
      firstPaymentDate: toApiDate('2026-01-28'),
      lastPaymentDate: null
    }
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
  const calls: Call[] = [];
  const failures = new Map<string, GraphQLError>();

  const requireAccount = () => {
    if (!db.account) throw apiError('ACCOUNT_NOT_LINKED', 'Account not linked');
    return db.account;
  };

  const rootValue = {
    tokenFindUser: () => db.user,
    account: () => requireAccount(),
    login: ({ email, password: attempt }: Args) => {
      if (email !== db.user.email || attempt !== db.password) {
        throw apiError('INVALID_CREDENTIALS', 'Incorrect email or password');
      }
      return { user: db.user, token: 'test-token', tokenExpiration: 1 };
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
