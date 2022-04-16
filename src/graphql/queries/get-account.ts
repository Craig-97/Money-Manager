import { gql } from '@apollo/client';

export const GET_ACCOUNT_QUERY = gql`
  query getAccount {
    account(id: $id) {
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
      notes {
        id
        body
        createdAt
      }
    }
  }
`;
