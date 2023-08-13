import { gql } from '@apollo/client';

export const EDIT_BILL_MUTATION = gql`
  mutation EditBill($id: ID!, $bill: BillInput!) {
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
