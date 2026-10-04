/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type AccountStatusQueryVariables = Exact<{
  userId: string | number;
}>;

export type AccountStatusQuery = { account: { __typename: 'Account'; id: string } | null };

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
export const AccountStatusDocument = {
  kind: 'Document',
  definitions: [
    {
      kind: 'OperationDefinition',
      operation: 'query',
      name: { kind: 'Name', value: 'AccountStatus' },
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
              selections: [{ kind: 'Field', name: { kind: 'Name', value: 'id' } }]
            }
          }
        ]
      }
    }
  ]
} as unknown as DocumentNode<AccountStatusQuery, AccountStatusQueryVariables>;
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
