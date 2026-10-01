import { gql, TypedDocumentNode } from '@apollo/client';
import { Account, Bill, OneOffPayment, Payday } from '~/types';

export interface CreateAccountResult {
  createAccount: { account: Account; success: boolean };
}

export interface CreateAccountVariables {
  account: {
    bankBalance: number;
    monthlyIncome: number;
    bills: Bill[];
    oneOffPayments: OneOffPayment[];
    payday: Payday;
    userId?: string;
  };
}

export const CREATE_ACCOUNT_MUTATION: TypedDocumentNode<
  CreateAccountResult,
  CreateAccountVariables
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
