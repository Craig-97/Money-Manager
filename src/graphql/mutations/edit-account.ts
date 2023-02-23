import { gql } from '@apollo/client';

export const EDIT_ACCOUNT_MUTATION = gql`
  mutation ($id: ID!, $account: EditAccountInput!) {
    editAccount(id: $id, account: $account) {
      account {
        bankBalance
        monthlyIncome
      }
      success
    }
  }
`;
