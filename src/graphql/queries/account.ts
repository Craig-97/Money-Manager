import { gql } from '@apollo/client';

export const GET_ACCOUNT_QUERY = gql`
  query Account($id: ID) {
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
        updatedAt
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
  }
`;
