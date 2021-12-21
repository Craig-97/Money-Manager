import { gql } from '@apollo/client';

export const CREATE_BILL_MUTATION = gql`
  mutation ($bill: BillInput!) {
    createBill(bill: $bill) {
      bill {
        account
        name
        amount
        paid
      }
      success
    }
  }
`;
