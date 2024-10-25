import { gql } from '@apollo/client';

export const CREATE_ACCOUNT_MUTATION = gql`
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
      }
      success
    }
  }
`;
