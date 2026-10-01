import { gql, TypedDocumentNode } from '@apollo/client';
import { AccountData } from '~/types';

export const GET_ACCOUNT_QUERY: TypedDocumentNode<AccountData, { id?: string }> = gql`
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
        dueDate
        type
        category
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
