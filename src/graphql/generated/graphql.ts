/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AccountQueryVariables = Exact<{
  userId: string | number;
}>;

export type AccountQuery = {
  account: {
    __typename: 'Account';
    id: string;
    bankBalance: number;
    monthlyIncome: number;
    cycleStartedOn: string | null;
    payday: {
      __typename: 'Payday';
      id: string;
      frequency: Types.PayFrequency;
      type: Types.PaydayType;
      dayOfMonth: number | null;
      weekday: Types.Weekday | null;
      firstPayDate: string | null;
      bankHolidayRegion: Types.BankHolidayRegion | null;
    } | null;
    recurringPayments: Array<{
      __typename: 'RecurringPayment';
      id: string;
      name: string;
      amount: number;
      category: Types.RecurringPaymentCategory;
      frequency: Types.PaymentFrequency;
      type: Types.PaymentType;
      firstPaymentDate: string;
      lastPaymentDate: string | null;
      nextDueDate: string | null;
      status: Types.PaymentStatus;
    } | null> | null;
    oneOffPayments: Array<{
      __typename: 'OneOffPayment';
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: Types.PaymentType;
      category: Types.OneOffPaymentCategory;
      paid: boolean;
    } | null> | null;
    notes: Array<{
      __typename: 'Note';
      id: string;
      body: string;
      color: Types.NoteColor;
      createdAt: string;
      updatedAt: string;
    } | null> | null;
  } | null;
};

export type AccountFieldsFragment = {
  __typename: 'Account';
  id: string;
  bankBalance: number;
  monthlyIncome: number;
  cycleStartedOn: string | null;
  payday: {
    __typename: 'Payday';
    id: string;
    frequency: Types.PayFrequency;
    type: Types.PaydayType;
    dayOfMonth: number | null;
    weekday: Types.Weekday | null;
    firstPayDate: string | null;
    bankHolidayRegion: Types.BankHolidayRegion | null;
  } | null;
  recurringPayments: Array<{
    __typename: 'RecurringPayment';
    id: string;
    name: string;
    amount: number;
    category: Types.RecurringPaymentCategory;
    frequency: Types.PaymentFrequency;
    type: Types.PaymentType;
    firstPaymentDate: string;
    lastPaymentDate: string | null;
    nextDueDate: string | null;
    status: Types.PaymentStatus;
  } | null> | null;
  oneOffPayments: Array<{
    __typename: 'OneOffPayment';
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    type: Types.PaymentType;
    category: Types.OneOffPaymentCategory;
    paid: boolean;
  } | null> | null;
  notes: Array<{
    __typename: 'Note';
    id: string;
    body: string;
    color: Types.NoteColor;
    createdAt: string;
    updatedAt: string;
  } | null> | null;
};

export type CreateAccountMutationVariables = Exact<{
  account: Types.CreateAccountInput;
}>;

export type CreateAccountMutation = {
  createAccount: {
    __typename: 'AccountResponse';
    account: {
      __typename: 'Account';
      id: string;
      bankBalance: number;
      monthlyIncome: number;
      cycleStartedOn: string | null;
      payday: {
        __typename: 'Payday';
        id: string;
        frequency: Types.PayFrequency;
        type: Types.PaydayType;
        dayOfMonth: number | null;
        weekday: Types.Weekday | null;
        firstPayDate: string | null;
        bankHolidayRegion: Types.BankHolidayRegion | null;
      } | null;
      recurringPayments: Array<{
        __typename: 'RecurringPayment';
        id: string;
        name: string;
        amount: number;
        category: Types.RecurringPaymentCategory;
        frequency: Types.PaymentFrequency;
        type: Types.PaymentType;
        firstPaymentDate: string;
        lastPaymentDate: string | null;
        nextDueDate: string | null;
        status: Types.PaymentStatus;
      } | null> | null;
      oneOffPayments: Array<{
        __typename: 'OneOffPayment';
        id: string;
        name: string;
        amount: number;
        dueDate: string;
        type: Types.PaymentType;
        category: Types.OneOffPaymentCategory;
        paid: boolean;
      } | null> | null;
      notes: Array<{
        __typename: 'Note';
        id: string;
        body: string;
        color: Types.NoteColor;
        createdAt: string;
        updatedAt: string;
      } | null> | null;
    } | null;
  };
};

export type EditAccountMutationVariables = Exact<{
  id: string | number;
  account: Types.EditAccountInput;
}>;

export type EditAccountMutation = {
  editAccount: {
    __typename: 'AccountResponse';
    account: {
      __typename: 'Account';
      id: string;
      bankBalance: number;
      monthlyIncome: number;
    } | null;
  };
};

export type StartPaydayCycleMutationVariables = Exact<{
  input: Types.StartPaydayCycleInput;
}>;

export type StartPaydayCycleMutation = {
  startPaydayCycle: {
    __typename: 'AccountResponse';
    account: {
      __typename: 'Account';
      id: string;
      bankBalance: number;
      cycleStartedOn: string | null;
      recurringPayments: Array<{
        __typename: 'RecurringPayment';
        id: string;
        name: string;
        amount: number;
        category: Types.RecurringPaymentCategory;
        frequency: Types.PaymentFrequency;
        type: Types.PaymentType;
        firstPaymentDate: string;
        lastPaymentDate: string | null;
        nextDueDate: string | null;
        status: Types.PaymentStatus;
      } | null> | null;
    } | null;
  };
};

export type AuthSessionFragment = {
  __typename: 'AuthData';
  token: string;
  tokenExpiration: number;
  user: { __typename: 'User'; id: string; email: string; firstName: string; surname: string };
};

export type LoginQueryVariables = Exact<{
  email: string;
  password: string;
}>;

export type LoginQuery = {
  login: {
    __typename: 'AuthData';
    token: string;
    tokenExpiration: number;
    user: { __typename: 'User'; id: string; email: string; firstName: string; surname: string };
  };
};

export type PasswordResetTokenValidQueryVariables = Exact<{
  token: string;
}>;

export type PasswordResetTokenValidQuery = { passwordResetTokenValid: boolean };

export type RegisterAndLoginMutationVariables = Exact<{
  user: Types.UserInput;
}>;

export type RegisterAndLoginMutation = {
  registerAndLogin: {
    __typename: 'AuthData';
    token: string;
    tokenExpiration: number;
    user: { __typename: 'User'; id: string; email: string; firstName: string; surname: string };
  };
};

export type RequestPasswordResetMutationVariables = Exact<{
  email: string;
}>;

export type RequestPasswordResetMutation = {
  requestPasswordReset: { __typename: 'PasswordResetResponse'; success: boolean };
};

export type ResetPasswordMutationVariables = Exact<{
  token: string;
  password: string;
}>;

export type ResetPasswordMutation = {
  resetPassword: {
    __typename: 'AuthData';
    token: string;
    tokenExpiration: number;
    user: { __typename: 'User'; id: string; email: string; firstName: string; surname: string };
  };
};

export type CreateNoteMutationVariables = Exact<{
  note: Types.NoteInput;
}>;

export type CreateNoteMutation = {
  createNote: {
    __typename: 'NoteResponse';
    note: {
      __typename: 'Note';
      id: string;
      body: string;
      color: Types.NoteColor;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
};

export type DeleteNoteMutationVariables = Exact<{
  id: string | number;
}>;

export type DeleteNoteMutation = {
  deleteNote: { __typename: 'NoteResponse'; success: boolean | null };
};

export type EditNoteMutationVariables = Exact<{
  id: string | number;
  note: Types.NoteInput;
}>;

export type EditNoteMutation = {
  editNote: {
    __typename: 'NoteResponse';
    note: {
      __typename: 'Note';
      id: string;
      body: string;
      color: Types.NoteColor;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
};

export type NoteFieldsFragment = {
  __typename: 'Note';
  id: string;
  body: string;
  color: Types.NoteColor;
  createdAt: string;
  updatedAt: string;
};

export type EditPaydayMutationVariables = Exact<{
  id: string | number;
  payday: Types.PaydayInput;
}>;

export type EditPaydayMutation = {
  editPayday: {
    __typename: 'PaydayResponse';
    payday: {
      __typename: 'Payday';
      id: string;
      frequency: Types.PayFrequency;
      type: Types.PaydayType;
      dayOfMonth: number | null;
      weekday: Types.Weekday | null;
      firstPayDate: string | null;
      bankHolidayRegion: Types.BankHolidayRegion | null;
    } | null;
  };
};

export type PaydayFieldsFragment = {
  __typename: 'Payday';
  id: string;
  frequency: Types.PayFrequency;
  type: Types.PaydayType;
  dayOfMonth: number | null;
  weekday: Types.Weekday | null;
  firstPayDate: string | null;
  bankHolidayRegion: Types.BankHolidayRegion | null;
};

export type BatchDeleteOneOffPaymentsMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
}>;

export type BatchDeleteOneOffPaymentsMutation = {
  batchDeleteOneOffPayments: { __typename: 'BatchOneOffPaymentResponse'; success: boolean };
};

export type BatchDeleteRecurringPaymentsMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
}>;

export type BatchDeleteRecurringPaymentsMutation = {
  batchDeleteRecurringPayments: { __typename: 'BatchDeleteResponse'; success: boolean };
};

export type BatchUpdateOneOffPaymentsMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
  paid: boolean;
}>;

export type BatchUpdateOneOffPaymentsMutation = {
  batchUpdateOneOffPayments: {
    __typename: 'BatchUpdateOneOffPaymentResponse';
    oneOffPayments: Array<{
      __typename: 'OneOffPayment';
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: Types.PaymentType;
      category: Types.OneOffPaymentCategory;
      paid: boolean;
    }>;
  };
};

export type BatchUpdateRecurringPaymentsMutationVariables = Exact<{
  input: Array<Types.BatchUpdateRecurringPaymentInput> | Types.BatchUpdateRecurringPaymentInput;
}>;

export type BatchUpdateRecurringPaymentsMutation = {
  batchUpdateRecurringPayments: {
    __typename: 'BatchRecurringPaymentResponse';
    recurringPayments: Array<{
      __typename: 'RecurringPayment';
      id: string;
      name: string;
      amount: number;
      category: Types.RecurringPaymentCategory;
      frequency: Types.PaymentFrequency;
      type: Types.PaymentType;
      firstPaymentDate: string;
      lastPaymentDate: string | null;
      nextDueDate: string | null;
      status: Types.PaymentStatus;
    }>;
  };
};

export type CreateOneOffPaymentMutationVariables = Exact<{
  oneOffPayment: Types.OneOffPaymentInput;
}>;

export type CreateOneOffPaymentMutation = {
  createOneOffPayment: {
    __typename: 'OneOffPaymentResponse';
    oneOffPayment: {
      __typename: 'OneOffPayment';
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: Types.PaymentType;
      category: Types.OneOffPaymentCategory;
      paid: boolean;
    } | null;
  };
};

export type CreateRecurringPaymentMutationVariables = Exact<{
  input: Types.CreateRecurringPaymentInput;
}>;

export type CreateRecurringPaymentMutation = {
  createRecurringPayment: {
    __typename: 'RecurringPaymentResponse';
    recurringPayment: {
      __typename: 'RecurringPayment';
      id: string;
      name: string;
      amount: number;
      category: Types.RecurringPaymentCategory;
      frequency: Types.PaymentFrequency;
      type: Types.PaymentType;
      firstPaymentDate: string;
      lastPaymentDate: string | null;
      nextDueDate: string | null;
      status: Types.PaymentStatus;
    } | null;
  };
};

export type EditOneOffPaymentMutationVariables = Exact<{
  id: string | number;
  oneOffPayment: Types.OneOffPaymentInput;
}>;

export type EditOneOffPaymentMutation = {
  editOneOffPayment: {
    __typename: 'OneOffPaymentResponse';
    oneOffPayment: {
      __typename: 'OneOffPayment';
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: Types.PaymentType;
      category: Types.OneOffPaymentCategory;
      paid: boolean;
    } | null;
  };
};

export type OneOffPaymentFieldsFragment = {
  __typename: 'OneOffPayment';
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  type: Types.PaymentType;
  category: Types.OneOffPaymentCategory;
  paid: boolean;
};

export type RecurringPaymentFieldsFragment = {
  __typename: 'RecurringPayment';
  id: string;
  name: string;
  amount: number;
  category: Types.RecurringPaymentCategory;
  frequency: Types.PaymentFrequency;
  type: Types.PaymentType;
  firstPaymentDate: string;
  lastPaymentDate: string | null;
  nextDueDate: string | null;
  status: Types.PaymentStatus;
};

export type UpdateRecurringPaymentMutationVariables = Exact<{
  id: string | number;
  input: Types.UpdateRecurringPaymentInput;
}>;

export type UpdateRecurringPaymentMutation = {
  updateRecurringPayment: {
    __typename: 'RecurringPaymentResponse';
    recurringPayment: {
      __typename: 'RecurringPayment';
      id: string;
      name: string;
      amount: number;
      category: Types.RecurringPaymentCategory;
      frequency: Types.PaymentFrequency;
      type: Types.PaymentType;
      firstPaymentDate: string;
      lastPaymentDate: string | null;
      nextDueDate: string | null;
      status: Types.PaymentStatus;
    } | null;
  };
};

export type ChangePasswordMutationVariables = Exact<{
  currentPassword: string;
  newPassword: string;
}>;

export type ChangePasswordMutation = {
  changePassword: { __typename: 'UserResponse'; success: boolean | null };
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  tokenFindUser: {
    __typename: 'User';
    id: string;
    email: string;
    firstName: string;
    surname: string;
  } | null;
};

export type DeleteCurrentUserMutationVariables = Exact<{ [key: string]: never }>;

export type DeleteCurrentUserMutation = {
  deleteCurrentUser: { __typename: 'UserResponse'; success: boolean | null };
};

export type UpdateCurrentUserMutationVariables = Exact<{
  input: Types.UserDetailsInput;
}>;

export type UpdateCurrentUserMutation = {
  updateCurrentUser: {
    __typename: 'UserResponse';
    user: {
      __typename: 'User';
      id: string;
      email: string;
      firstName: string;
      surname: string;
    } | null;
  };
};

export const PaydayFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PaydayFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Payday' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dayOfMonth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weekday' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPayDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<PaydayFieldsFragment, unknown>;
export const RecurringPaymentFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RecurringPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RecurringPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextDueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<RecurringPaymentFieldsFragment, unknown>;
export const OneOffPaymentFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OneOffPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paid' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<OneOffPaymentFieldsFragment, unknown>;
export const NoteFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NoteFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Note' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'color' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<NoteFieldsFragment, unknown>;
export const AccountFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Account' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bankBalance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'monthlyIncome' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cycleStartedOn' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'payday' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PaydayFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recurringPayments' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RecurringPaymentFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'oneOffPayments' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'OneOffPaymentFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'notes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'NoteFields' } }]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PaydayFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Payday' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dayOfMonth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weekday' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPayDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RecurringPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RecurringPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextDueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OneOffPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paid' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NoteFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Note' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'color' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<AccountFieldsFragment, unknown>;
export const AuthSessionFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AuthSession' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AuthData' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'token' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tokenExpiration' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'user' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'surname' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<AuthSessionFragment, unknown>;
export const AccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Account' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'account' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'userId' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AccountFields' } }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PaydayFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Payday' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dayOfMonth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weekday' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPayDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RecurringPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RecurringPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextDueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OneOffPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paid' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NoteFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Note' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'color' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Account' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bankBalance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'monthlyIncome' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cycleStartedOn' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'payday' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PaydayFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recurringPayments' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RecurringPaymentFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'oneOffPayments' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'OneOffPaymentFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'notes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'NoteFields' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<AccountQuery, AccountQueryVariables>;
export const CreateAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateAccount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'account' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateAccountInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createAccount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'account' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'account' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'account' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'AccountFields' } }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PaydayFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Payday' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dayOfMonth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weekday' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPayDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RecurringPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RecurringPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextDueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OneOffPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paid' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NoteFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Note' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'color' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AccountFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Account' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bankBalance' } },
          { kind: 'Field', name: { kind: 'Name', value: 'monthlyIncome' } },
          { kind: 'Field', name: { kind: 'Name', value: 'cycleStartedOn' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'payday' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PaydayFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'recurringPayments' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'RecurringPaymentFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'oneOffPayments' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'FragmentSpread', name: { kind: 'Name', value: 'OneOffPaymentFields' } }
              ]
            }
          },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'notes' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'NoteFields' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<CreateAccountMutation, CreateAccountMutationVariables>;
export const EditAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'EditAccount' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'account' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'EditAccountInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'editAccount' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'account' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'account' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'account' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'bankBalance' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'monthlyIncome' } }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<EditAccountMutation, EditAccountMutationVariables>;
export const StartPaydayCycleDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'StartPaydayCycle' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'StartPaydayCycleInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'startPaydayCycle' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'account' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'bankBalance' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'cycleStartedOn' } },
                      {
                        kind: 'Field',
                        name: { kind: 'Name', value: 'recurringPayments' },
                        selectionSet: {
                          kind: 'SelectionSet',
                          selections: [
                            {
                              kind: 'FragmentSpread',
                              name: { kind: 'Name', value: 'RecurringPaymentFields' }
                            }
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RecurringPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RecurringPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextDueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<StartPaydayCycleMutation, StartPaydayCycleMutationVariables>;
export const LoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'Login' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'email' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'login' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'email' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'email' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'password' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AuthSession' } }]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AuthSession' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AuthData' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'token' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tokenExpiration' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'user' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'surname' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<LoginQuery, LoginQueryVariables>;
export const PasswordResetTokenValidDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'PasswordResetTokenValid' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'token' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'passwordResetTokenValid' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'token' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'token' } }
              }
            ]
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<PasswordResetTokenValidQuery, PasswordResetTokenValidQueryVariables>;
export const RegisterAndLoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RegisterAndLogin' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'user' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UserInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'registerAndLogin' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'user' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'user' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AuthSession' } }]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AuthSession' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AuthData' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'token' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tokenExpiration' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'user' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'surname' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<RegisterAndLoginMutation, RegisterAndLoginMutationVariables>;
export const RequestPasswordResetDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RequestPasswordReset' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'email' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'requestPasswordReset' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'email' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'email' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'success' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<RequestPasswordResetMutation, RequestPasswordResetMutationVariables>;
export const ResetPasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ResetPassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'token' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'password' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'resetPassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'token' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'token' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'password' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'password' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'AuthSession' } }]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'AuthSession' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'AuthData' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'token' } },
          { kind: 'Field', name: { kind: 'Name', value: 'tokenExpiration' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'user' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'surname' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<ResetPasswordMutation, ResetPasswordMutationVariables>;
export const CreateNoteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateNote' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'note' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'NoteInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createNote' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'note' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'note' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'note' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'NoteFields' } }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NoteFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Note' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'color' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<CreateNoteMutation, CreateNoteMutationVariables>;
export const DeleteNoteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteNote' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteNote' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'success' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<DeleteNoteMutation, DeleteNoteMutationVariables>;
export const EditNoteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'EditNote' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'note' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'NoteInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'editNote' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'note' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'note' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'note' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'NoteFields' } }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'NoteFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Note' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'body' } },
          { kind: 'Field', name: { kind: 'Name', value: 'color' } },
          { kind: 'Field', name: { kind: 'Name', value: 'createdAt' } },
          { kind: 'Field', name: { kind: 'Name', value: 'updatedAt' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<EditNoteMutation, EditNoteMutationVariables>;
export const EditPaydayDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'EditPayday' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'payday' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'PaydayInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'editPayday' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'payday' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'payday' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'payday' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'FragmentSpread', name: { kind: 'Name', value: 'PaydayFields' } }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'PaydayFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'Payday' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dayOfMonth' } },
          { kind: 'Field', name: { kind: 'Name', value: 'weekday' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPayDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<EditPaydayMutation, EditPaydayMutationVariables>;
export const BatchDeleteOneOffPaymentsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'BatchDeleteOneOffPayments' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
              }
            }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'batchDeleteOneOffPayments' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ids' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'success' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<
  BatchDeleteOneOffPaymentsMutation,
  BatchDeleteOneOffPaymentsMutationVariables
>;
export const BatchDeleteRecurringPaymentsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'BatchDeleteRecurringPayments' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
              }
            }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'batchDeleteRecurringPayments' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ids' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'success' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<
  BatchDeleteRecurringPaymentsMutation,
  BatchDeleteRecurringPaymentsMutationVariables
>;
export const BatchUpdateOneOffPaymentsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'BatchUpdateOneOffPayments' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
              }
            }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'paid' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'Boolean' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'batchUpdateOneOffPayments' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'ids' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'ids' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'paid' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'paid' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'oneOffPayments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'OneOffPaymentFields' }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OneOffPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paid' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<
  BatchUpdateOneOffPaymentsMutation,
  BatchUpdateOneOffPaymentsMutationVariables
>;
export const BatchUpdateRecurringPaymentsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'BatchUpdateRecurringPayments' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'ListType',
              type: {
                kind: 'NonNullType',
                type: {
                  kind: 'NamedType',
                  name: { kind: 'Name', value: 'BatchUpdateRecurringPaymentInput' }
                }
              }
            }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'batchUpdateRecurringPayments' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'recurringPayments' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'RecurringPaymentFields' }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RecurringPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RecurringPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextDueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<
  BatchUpdateRecurringPaymentsMutation,
  BatchUpdateRecurringPaymentsMutationVariables
>;
export const CreateOneOffPaymentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateOneOffPayment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'oneOffPayment' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPaymentInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createOneOffPayment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'oneOffPayment' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'oneOffPayment' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'oneOffPayment' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'OneOffPaymentFields' }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OneOffPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paid' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<CreateOneOffPaymentMutation, CreateOneOffPaymentMutationVariables>;
export const CreateRecurringPaymentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'CreateRecurringPayment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'CreateRecurringPaymentInput' }
            }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'createRecurringPayment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'recurringPayment' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'RecurringPaymentFields' }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RecurringPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RecurringPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextDueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<
  CreateRecurringPaymentMutation,
  CreateRecurringPaymentMutationVariables
>;
export const EditOneOffPaymentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'EditOneOffPayment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'oneOffPayment' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPaymentInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'editOneOffPayment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'oneOffPayment' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'oneOffPayment' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'oneOffPayment' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'OneOffPaymentFields' }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'OneOffPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'OneOffPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'dueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'paid' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<EditOneOffPaymentMutation, EditOneOffPaymentMutationVariables>;
export const UpdateRecurringPaymentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateRecurringPayment' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'id' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'ID' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: {
              kind: 'NamedType',
              name: { kind: 'Name', value: 'UpdateRecurringPaymentInput' }
            }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateRecurringPayment' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'recurringPayment' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      {
                        kind: 'FragmentSpread',
                        name: { kind: 'Name', value: 'RecurringPaymentFields' }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'RecurringPaymentFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'RecurringPayment' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'name' } },
          { kind: 'Field', name: { kind: 'Name', value: 'amount' } },
          { kind: 'Field', name: { kind: 'Name', value: 'category' } },
          { kind: 'Field', name: { kind: 'Name', value: 'frequency' } },
          { kind: 'Field', name: { kind: 'Name', value: 'type' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'lastPaymentDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'nextDueDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'status' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<
  UpdateRecurringPaymentMutation,
  UpdateRecurringPaymentMutationVariables
>;
export const ChangePasswordDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'ChangePassword' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'currentPassword' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'newPassword' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'changePassword' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'currentPassword' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'currentPassword' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'newPassword' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'newPassword' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'success' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<ChangePasswordMutation, ChangePasswordMutationVariables>;
export const CurrentUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'CurrentUser' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'tokenFindUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                { kind: 'Field', name: { kind: 'Name', value: 'surname' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<CurrentUserQuery, CurrentUserQueryVariables>;
export const DeleteCurrentUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'DeleteCurrentUser' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'deleteCurrentUser' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'success' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<DeleteCurrentUserMutation, DeleteCurrentUserMutationVariables>;
export const UpdateCurrentUserDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateCurrentUser' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UserDetailsInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateCurrentUser' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }
              }
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                {
                  kind: 'Field',
                  name: { kind: 'Name', value: 'user' },
                  selectionSet: {
                    kind: 'SelectionSet',
                    selections: [
                      { kind: 'Field', name: { kind: 'Name', value: 'id' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'email' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'surname' } }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<UpdateCurrentUserMutation, UpdateCurrentUserMutationVariables>;
