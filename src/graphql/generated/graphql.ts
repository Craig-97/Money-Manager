/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AccountQueryVariables = Exact<{ [key: string]: never }>;

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
      overrides: Array<{ __typename: 'PaydayOverride'; for: string; date: string }>;
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
      renewalDate: string | null;
      renewalReminderDays: number;
      handled: Array<{
        __typename: 'HandledDates';
        outcome: Types.PaymentOutcome;
        dates: Array<string>;
      }>;
    } | null> | null;
    oneOffPayments: Array<{
      __typename: 'OneOffPayment';
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: Types.PaymentType;
      category: Types.OneOffPaymentCategory;
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
    overrides: Array<{ __typename: 'PaydayOverride'; for: string; date: string }>;
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
    renewalDate: string | null;
    renewalReminderDays: number;
    handled: Array<{
      __typename: 'HandledDates';
      outcome: Types.PaymentOutcome;
      dates: Array<string>;
    }>;
  } | null> | null;
  oneOffPayments: Array<{
    __typename: 'OneOffPayment';
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    type: Types.PaymentType;
    category: Types.OneOffPaymentCategory;
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
  input: Types.CreateAccountInput;
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
        overrides: Array<{ __typename: 'PaydayOverride'; for: string; date: string }>;
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
        renewalDate: string | null;
        renewalReminderDays: number;
        handled: Array<{
          __typename: 'HandledDates';
          outcome: Types.PaymentOutcome;
          dates: Array<string>;
        }>;
      } | null> | null;
      oneOffPayments: Array<{
        __typename: 'OneOffPayment';
        id: string;
        name: string;
        amount: number;
        dueDate: string;
        type: Types.PaymentType;
        category: Types.OneOffPaymentCategory;
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

export type MarkPaymentsPaidMutationVariables = Exact<{
  input: Types.MarkPaymentsPaidInput;
}>;

export type MarkPaymentsPaidMutation = {
  markPaymentsPaid: {
    __typename: 'AccountResponse';
    account: {
      __typename: 'Account';
      id: string;
      bankBalance: number;
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
        renewalDate: string | null;
        renewalReminderDays: number;
        handled: Array<{
          __typename: 'HandledDates';
          outcome: Types.PaymentOutcome;
          dates: Array<string>;
        }>;
      } | null> | null;
      oneOffPayments: Array<{
        __typename: 'OneOffPayment';
        id: string;
        name: string;
        amount: number;
        dueDate: string;
        type: Types.PaymentType;
        category: Types.OneOffPaymentCategory;
      } | null> | null;
    } | null;
  };
};

export type MarkPaymentsUnpaidMutationVariables = Exact<{
  input: Types.MarkPaymentsUnpaidInput;
}>;

export type MarkPaymentsUnpaidMutation = {
  markPaymentsUnpaid: {
    __typename: 'AccountResponse';
    account: {
      __typename: 'Account';
      id: string;
      bankBalance: number;
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
        renewalDate: string | null;
        renewalReminderDays: number;
        handled: Array<{
          __typename: 'HandledDates';
          outcome: Types.PaymentOutcome;
          dates: Array<string>;
        }>;
      } | null> | null;
    } | null;
  };
};

export type SkipRecurringPaymentsMutationVariables = Exact<{
  input: Types.SkipRecurringPaymentsInput;
}>;

export type SkipRecurringPaymentsMutation = {
  skipRecurringPayments: {
    __typename: 'AccountResponse';
    account: {
      __typename: 'Account';
      id: string;
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
        renewalDate: string | null;
        renewalReminderDays: number;
        handled: Array<{
          __typename: 'HandledDates';
          outcome: Types.PaymentOutcome;
          dates: Array<string>;
        }>;
      } | null> | null;
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
        renewalDate: string | null;
        renewalReminderDays: number;
        handled: Array<{
          __typename: 'HandledDates';
          outcome: Types.PaymentOutcome;
          dates: Array<string>;
        }>;
      } | null> | null;
    } | null;
  };
};

export type UpdateAccountMutationVariables = Exact<{
  id: string | number;
  input: Types.UpdateAccountInput;
}>;

export type UpdateAccountMutation = {
  updateAccount: {
    __typename: 'AccountResponse';
    account: {
      __typename: 'Account';
      id: string;
      bankBalance: number;
      monthlyIncome: number;
    } | null;
  };
};

export type AuthSessionFragment = {
  __typename: 'AuthData';
  token: string;
  tokenExpiration: number;
  user: {
    __typename: 'User';
    id: string;
    account: string | null;
    email: string;
    firstName: string;
    surname: string;
    theme: Types.ThemePreference | null;
    accent: string | null;
  };
};

export type LoginMutationVariables = Exact<{
  email: string;
  password: string;
}>;

export type LoginMutation = {
  login: {
    __typename: 'AuthData';
    token: string;
    tokenExpiration: number;
    user: {
      __typename: 'User';
      id: string;
      account: string | null;
      email: string;
      firstName: string;
      surname: string;
      theme: Types.ThemePreference | null;
      accent: string | null;
    };
  };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { logout: { __typename: 'SuccessResponse'; success: boolean } };

export type LogoutEverywhereMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutEverywhereMutation = {
  logoutEverywhere: { __typename: 'SuccessResponse'; success: boolean };
};

export type PasswordResetTokenValidQueryVariables = Exact<{
  token: string;
}>;

export type PasswordResetTokenValidQuery = {
  passwordResetTokenValid: {
    __typename: 'PasswordResetTokenCheck';
    valid: boolean;
    email: string | null;
  };
};

export type RefreshSessionMutationVariables = Exact<{ [key: string]: never }>;

export type RefreshSessionMutation = {
  refreshSession: {
    __typename: 'AuthData';
    token: string;
    tokenExpiration: number;
    user: {
      __typename: 'User';
      id: string;
      account: string | null;
      email: string;
      firstName: string;
      surname: string;
      theme: Types.ThemePreference | null;
      accent: string | null;
    };
  };
};

export type RegisterAndLoginMutationVariables = Exact<{
  input: Types.RegisterInput;
}>;

export type RegisterAndLoginMutation = {
  registerAndLogin: {
    __typename: 'AuthData';
    token: string;
    tokenExpiration: number;
    user: {
      __typename: 'User';
      id: string;
      account: string | null;
      email: string;
      firstName: string;
      surname: string;
      theme: Types.ThemePreference | null;
      accent: string | null;
    };
  };
};

export type RequestPasswordResetMutationVariables = Exact<{
  email: string;
}>;

export type RequestPasswordResetMutation = {
  requestPasswordReset: { __typename: 'SuccessResponse'; success: boolean };
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
    user: {
      __typename: 'User';
      id: string;
      account: string | null;
      email: string;
      firstName: string;
      surname: string;
      theme: Types.ThemePreference | null;
      accent: string | null;
    };
  };
};

export type CreateNoteMutationVariables = Exact<{
  input: Types.CreateNoteInput;
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

export type DeleteNoteMutation = { deleteNote: { __typename: 'DeleteResponse'; success: boolean } };

export type NoteFieldsFragment = {
  __typename: 'Note';
  id: string;
  body: string;
  color: Types.NoteColor;
  createdAt: string;
  updatedAt: string;
};

export type UpdateNoteMutationVariables = Exact<{
  id: string | number;
  input: Types.UpdateNoteInput;
}>;

export type UpdateNoteMutation = {
  updateNote: {
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

export type PaydayFieldsFragment = {
  __typename: 'Payday';
  id: string;
  frequency: Types.PayFrequency;
  type: Types.PaydayType;
  dayOfMonth: number | null;
  weekday: Types.Weekday | null;
  firstPayDate: string | null;
  bankHolidayRegion: Types.BankHolidayRegion | null;
  overrides: Array<{ __typename: 'PaydayOverride'; for: string; date: string }>;
};

export type SetPaydayOverrideMutationVariables = Exact<{
  id: string | number;
  for: string;
  date?: string | null | undefined;
}>;

export type SetPaydayOverrideMutation = {
  setPaydayOverride: {
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
      overrides: Array<{ __typename: 'PaydayOverride'; for: string; date: string }>;
    } | null;
  };
};

export type UpdatePaydayMutationVariables = Exact<{
  id: string | number;
  input: Types.PaydayInput;
}>;

export type UpdatePaydayMutation = {
  updatePayday: {
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
      overrides: Array<{ __typename: 'PaydayOverride'; for: string; date: string }>;
    } | null;
  };
};

export type BatchDeleteOneOffPaymentsMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
}>;

export type BatchDeleteOneOffPaymentsMutation = {
  batchDeleteOneOffPayments: { __typename: 'DeleteResponse'; success: boolean };
};

export type BatchDeleteRecurringPaymentsMutationVariables = Exact<{
  ids: Array<string | number> | string | number;
}>;

export type BatchDeleteRecurringPaymentsMutation = {
  batchDeleteRecurringPayments: { __typename: 'DeleteResponse'; success: boolean };
};

export type CreateOneOffPaymentMutationVariables = Exact<{
  input: Types.CreateOneOffPaymentInput;
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
      renewalDate: string | null;
      renewalReminderDays: number;
      handled: Array<{
        __typename: 'HandledDates';
        outcome: Types.PaymentOutcome;
        dates: Array<string>;
      }>;
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
  renewalDate: string | null;
  renewalReminderDays: number;
  handled: Array<{
    __typename: 'HandledDates';
    outcome: Types.PaymentOutcome;
    dates: Array<string>;
  }>;
};

export type UpdateOneOffPaymentMutationVariables = Exact<{
  id: string | number;
  input: Types.UpdateOneOffPaymentInput;
}>;

export type UpdateOneOffPaymentMutation = {
  updateOneOffPayment: {
    __typename: 'OneOffPaymentResponse';
    oneOffPayment: {
      __typename: 'OneOffPayment';
      id: string;
      name: string;
      amount: number;
      dueDate: string;
      type: Types.PaymentType;
      category: Types.OneOffPaymentCategory;
    } | null;
  };
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
      renewalDate: string | null;
      renewalReminderDays: number;
      handled: Array<{
        __typename: 'HandledDates';
        outcome: Types.PaymentOutcome;
        dates: Array<string>;
      }>;
    } | null;
  };
};

export type ChangePasswordMutationVariables = Exact<{
  currentPassword: string;
  newPassword: string;
}>;

export type ChangePasswordMutation = {
  changePassword: { __typename: 'UserResponse'; success: boolean };
};

export type CurrentUserQueryVariables = Exact<{ [key: string]: never }>;

export type CurrentUserQuery = {
  tokenFindUser: {
    __typename: 'User';
    id: string;
    account: string | null;
    email: string;
    firstName: string;
    surname: string;
    theme: Types.ThemePreference | null;
    accent: string | null;
  } | null;
};

export type DeleteCurrentUserMutationVariables = Exact<{ [key: string]: never }>;

export type DeleteCurrentUserMutation = {
  deleteCurrentUser: { __typename: 'UserResponse'; success: boolean };
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

export type UpdatePreferencesMutationVariables = Exact<{
  theme?: Types.ThemePreference | null | undefined;
  accent?: string | null | undefined;
}>;

export type UpdatePreferencesMutation = {
  updatePreferences: {
    __typename: 'UserResponse';
    user: {
      __typename: 'User';
      id: string;
      theme: Types.ThemePreference | null;
      accent: string | null;
    } | null;
  };
};

export type UserFieldsFragment = {
  __typename: 'User';
  id: string;
  account: string | null;
  email: string;
  firstName: string;
  surname: string;
  theme: Types.ThemePreference | null;
  accent: string | null;
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
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'overrides' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'for' } },
                { kind: 'Field', name: { kind: 'Name', value: 'date' } }
              ]
            }
          }
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
              ]
            }
          }
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
          { kind: 'Field', name: { kind: 'Name', value: 'category' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'overrides' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'for' } },
                { kind: 'Field', name: { kind: 'Name', value: 'date' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'category' } }
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
export const UserFieldsFragmentDoc = {
  kind: 'Document',
  definitions: [
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'account' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'surname' } },
          { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
          { kind: 'Field', name: { kind: 'Name', value: 'accent' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<UserFieldsFragment, unknown>;
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFields' } }]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'account' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'surname' } },
          { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
          { kind: 'Field', name: { kind: 'Name', value: 'accent' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'overrides' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'for' } },
                { kind: 'Field', name: { kind: 'Name', value: 'date' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'category' } }
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
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
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'overrides' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'for' } },
                { kind: 'Field', name: { kind: 'Name', value: 'date' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'category' } }
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
export const MarkPaymentsPaidDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkPaymentsPaid' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'MarkPaymentsPaidInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markPaymentsPaid' },
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
                      },
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'category' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<MarkPaymentsPaidMutation, MarkPaymentsPaidMutationVariables>;
export const MarkPaymentsUnpaidDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'MarkPaymentsUnpaid' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'MarkPaymentsUnpaidInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'markPaymentsUnpaid' },
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<MarkPaymentsUnpaidMutation, MarkPaymentsUnpaidMutationVariables>;
export const SkipRecurringPaymentsDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SkipRecurringPayments' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'SkipRecurringPaymentsInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'skipRecurringPayments' },
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<SkipRecurringPaymentsMutation, SkipRecurringPaymentsMutationVariables>;
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<StartPaydayCycleMutation, StartPaydayCycleMutationVariables>;
export const UpdateAccountDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateAccount' },
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
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateAccountInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateAccount' },
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
} as unknown as DocumentNode<UpdateAccountMutation, UpdateAccountMutationVariables>;
export const LoginDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
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
      name: { kind: 'Name', value: 'UserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'account' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'surname' } },
          { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
          { kind: 'Field', name: { kind: 'Name', value: 'accent' } }
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFields' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const LogoutDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'Logout' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'logout' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'success' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const LogoutEverywhereDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'LogoutEverywhere' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'logoutEverywhere' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'success' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<LogoutEverywhereMutation, LogoutEverywhereMutationVariables>;
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
            ],
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'valid' } },
                { kind: 'Field', name: { kind: 'Name', value: 'email' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<PasswordResetTokenValidQuery, PasswordResetTokenValidQueryVariables>;
export const RefreshSessionDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'RefreshSession' },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'refreshSession' },
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
      name: { kind: 'Name', value: 'UserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'account' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'surname' } },
          { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
          { kind: 'Field', name: { kind: 'Name', value: 'accent' } }
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFields' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<RefreshSessionMutation, RefreshSessionMutationVariables>;
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'RegisterInput' } }
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
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }
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
      name: { kind: 'Name', value: 'UserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'account' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'surname' } },
          { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
          { kind: 'Field', name: { kind: 'Name', value: 'accent' } }
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFields' } }]
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
      name: { kind: 'Name', value: 'UserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'account' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'surname' } },
          { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
          { kind: 'Field', name: { kind: 'Name', value: 'accent' } }
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFields' } }]
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateNoteInput' } }
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
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }
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
export const UpdateNoteDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateNote' },
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
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateNoteInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateNote' },
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
} as unknown as DocumentNode<UpdateNoteMutation, UpdateNoteMutationVariables>;
export const SetPaydayOverrideDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'SetPaydayOverride' },
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'for' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
          }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'date' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'setPaydayOverride' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'id' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'id' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'for' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'for' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'date' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'date' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'overrides' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'for' } },
                { kind: 'Field', name: { kind: 'Name', value: 'date' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<SetPaydayOverrideMutation, SetPaydayOverrideMutationVariables>;
export const UpdatePaydayDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePayday' },
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
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'PaydayInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePayday' },
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
          { kind: 'Field', name: { kind: 'Name', value: 'bankHolidayRegion' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'overrides' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'for' } },
                { kind: 'Field', name: { kind: 'Name', value: 'date' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<UpdatePaydayMutation, UpdatePaydayMutationVariables>;
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
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'input' } },
          type: {
            kind: 'NonNullType',
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'CreateOneOffPaymentInput' } }
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
                name: { kind: 'Name', value: 'input' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'input' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'category' } }
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
              ]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<
  CreateRecurringPaymentMutation,
  CreateRecurringPaymentMutationVariables
>;
export const UpdateOneOffPaymentDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdateOneOffPayment' },
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
            type: { kind: 'NamedType', name: { kind: 'Name', value: 'UpdateOneOffPaymentInput' } }
          }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updateOneOffPayment' },
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
          { kind: 'Field', name: { kind: 'Name', value: 'category' } }
        ]
      }
    }
  ]
} as unknown as DocumentNode<UpdateOneOffPaymentMutation, UpdateOneOffPaymentMutationVariables>;
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
          { kind: 'Field', name: { kind: 'Name', value: 'renewalDate' } },
          { kind: 'Field', name: { kind: 'Name', value: 'renewalReminderDays' } },
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'handled' },
            selectionSet: {
              kind: 'SelectionSet',
              selections: [
                { kind: 'Field', name: { kind: 'Name', value: 'outcome' } },
                { kind: 'Field', name: { kind: 'Name', value: 'dates' } }
              ]
            }
          }
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
              selections: [{ kind: 'FragmentSpread', name: { kind: 'Name', value: 'UserFields' } }]
            }
          }
        ]
      }
    },
    {
      kind: 'FragmentDefinition',
      name: { kind: 'Name', value: 'UserFields' },
      typeCondition: { kind: 'NamedType', name: { kind: 'Name', value: 'User' } },
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          { kind: 'Field', name: { kind: 'Name', value: 'id' } },
          { kind: 'Field', name: { kind: 'Name', value: 'account' } },
          { kind: 'Field', name: { kind: 'Name', value: 'email' } },
          { kind: 'Field', name: { kind: 'Name', value: 'firstName' } },
          { kind: 'Field', name: { kind: 'Name', value: 'surname' } },
          { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
          { kind: 'Field', name: { kind: 'Name', value: 'accent' } }
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
export const UpdatePreferencesDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'mutation',
      name: { kind: 'Name', value: 'UpdatePreferences' },
      variableDefinitions: [
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'theme' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'ThemePreference' } }
        },
        {
          kind: 'VariableDefinition',
          variable: { kind: 'Variable', name: { kind: 'Name', value: 'accent' } },
          type: { kind: 'NamedType', name: { kind: 'Name', value: 'String' } }
        }
      ],
      selectionSet: {
        kind: 'SelectionSet',
        selections: [
          {
            kind: 'Field',
            name: { kind: 'Name', value: 'updatePreferences' },
            arguments: [
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'theme' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'theme' } }
              },
              {
                kind: 'Argument',
                name: { kind: 'Name', value: 'accent' },
                value: { kind: 'Variable', name: { kind: 'Name', value: 'accent' } }
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
                      { kind: 'Field', name: { kind: 'Name', value: 'theme' } },
                      { kind: 'Field', name: { kind: 'Name', value: 'accent' } }
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
} as unknown as DocumentNode<UpdatePreferencesMutation, UpdatePreferencesMutationVariables>;
