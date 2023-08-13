import { gql } from '@apollo/client';

export const DELETE_BILL_MUTATION = gql`
  mutation DeleteBill($id: ID!) {
    deleteBill(id: $id) {
      bill {
        id
      }
      success
    }
  }
`;
