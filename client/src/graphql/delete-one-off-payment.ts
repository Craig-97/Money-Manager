import { gql } from '@apollo/client';

export const DELETE_ONE_OFF_PAYMENT_MUTATION = gql`
  mutation ($id: ID!) {
    deleteOneOffPayment(id: $id) {
      oneOffPayment {
        id
        name
        amount
      }
      success
    }
  }
`;
