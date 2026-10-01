import { gql, TypedDocumentNode } from '@apollo/client';
import { OneOffPayment } from '~/types';

export interface CreateOneOffPaymentResult {
  createOneOffPayment: { oneOffPayment: OneOffPayment };
}

export interface CreateOneOffPaymentVariables {
  oneOffPayment: OneOffPayment;
}

export const CREATE_ONE_OFF_PAYMENT_MUTATION: TypedDocumentNode<
  CreateOneOffPaymentResult,
  CreateOneOffPaymentVariables
> = gql`
  mutation CreateOneOffPayment($oneOffPayment: OneOffPaymentInput!) {
    createOneOffPayment(oneOffPayment: $oneOffPayment) {
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
