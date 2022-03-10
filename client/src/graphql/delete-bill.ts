import { gql } from '@apollo/client';

export const DELETE_BILL_MUTATION = gql`
  mutation ($id: ID!) {
    deleteBill(id: $id) {
      success
    }
  }
`;
