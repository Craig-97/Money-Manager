import { gql } from '@apollo/client';

export const CREATE_ONE_OFF_PAYMENT_MUTATION = gql`
  mutation CreateOneOffPayment($oneOffPayment: OneOffPaymentInput!) {
    createOneOffPayment(oneOffPayment: $oneOffPayment) {
      oneOffPayment {
        id
        name
        amount
      }
      success
    }
  }
`;
