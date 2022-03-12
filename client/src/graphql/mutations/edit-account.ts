import { gql } from '@apollo/client';

export const EDIT_ACCOUNT_MUTATION = gql`
  mutation ($id: ID!, $account: AccountInput!) {
    editAccount(id: $id, account: $account) {
      account {
        bankBalance
        monthlyIncome
        bankPaydayTotal
      }
      success
    }
  }
`;
