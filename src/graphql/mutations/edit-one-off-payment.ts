import { gql } from '@apollo/client';

export const EDIT_ONE_OFF_PAYMENT_MUTATION = gql`
  mutation EditOneOffPayment($id: ID!, $oneOffPayment: OneOffPaymentInput!) {
    editOneOffPayment(id: $id, oneOffPayment: $oneOffPayment) {
      oneOffPayment {
        id
        name
        amount
        dueDate
        type
        category
      }
      success
    }
  }
`;
