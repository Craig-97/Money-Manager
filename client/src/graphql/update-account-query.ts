import { gql } from '@apollo/client';

export const UPDATE_ACCOUNT_MUTATION = gql`
  mutation ($id: ID!, $account: AccountInput!) {
    updateAccount(id: $id, account: $account) {
      account {
        bankBalance
        monthlyIncome
        bankPaydayTotal
      }
      success
    }
  }
`;
