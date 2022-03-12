import { gql } from '@apollo/client';

export const EDIT_BILL_MUTATION = gql`
  mutation ($id: ID!, $bill: BillInput!) {
    editBill(id: $id, bill: $bill) {
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
