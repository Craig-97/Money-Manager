import { gql } from '@apollo/client';

export const DELETE_ONE_OFF_PAYMENT_MUTATION = gql`
  mutation DeleteOneOffPayment($id: ID!) {
    deleteOneOffPayment(id: $id) {
      oneOffPayment {
        id
        amount
      }
      success
    }
  }
`;
