import { gql } from '@apollo/client';

export const CREATE_BILL_MUTATION = gql`
  mutation ($bill: BillInput!) {
    createBill(bill: $bill) {
      bill {
        id
        name
        amount
        paid
      }
      success
    }
  }
`;
