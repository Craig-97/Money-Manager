import { gql, TypedDocumentNode } from '@apollo/client';
import { CreateAccountMutationVariables } from '../generated';
import { Account } from '~/types';

export interface CreateAccountResult {
  createAccount: { account: Account; success: boolean };
}

export const CREATE_ACCOUNT_MUTATION: TypedDocumentNode<
  CreateAccountResult,
  CreateAccountMutationVariables
> = gql`
  mutation CreateAccount($account: CreateAccountInput!) {
    createAccount(account: $account) {
      account {
        id
        bankBalance
        monthlyIncome
        bills {
          id
          name
          amount
          paid
        }
        oneOffPayments {
          id
          name
          amount
        }
        payday {
          frequency
          type
          dayOfMonth
          weekday
          firstPayDate
          bankHolidayRegion
        }
      }
      success
    }
  }
`;
