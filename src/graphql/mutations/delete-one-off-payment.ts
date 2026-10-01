import { gql, TypedDocumentNode } from '@apollo/client';
import { OneOffPayment } from '~/types';

export interface DeleteOneOffPaymentResult {
  deleteOneOffPayment: { oneOffPayment: OneOffPayment; success: boolean };
}

export interface DeleteOneOffPaymentVariables {
  id: string;
}

export const DELETE_ONE_OFF_PAYMENT_MUTATION: TypedDocumentNode<
  DeleteOneOffPaymentResult,
  DeleteOneOffPaymentVariables
> = gql`
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
