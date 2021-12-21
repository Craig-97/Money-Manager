import { gql } from '@apollo/client';

export const GET_ACCOUNT_QUERY = gql`
  query getAccount {
    account(id: "60b7ed9011a2ab48547b6e54") {
      id
      bankBalance
      monthlyIncome
      bankPaydayTotal
      bills {
        id
        name
        amount
        paid
      }
    }
  }
`;
