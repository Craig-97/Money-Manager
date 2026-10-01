import { gql, TypedDocumentNode } from '@apollo/client';
import { DeleteOneOffPaymentMutationVariables } from '../generated';
import { OneOffPayment } from '~/types';

export interface DeleteOneOffPaymentResult {
  deleteOneOffPayment: { oneOffPayment: OneOffPayment; success: boolean };
}

export const DELETE_ONE_OFF_PAYMENT_MUTATION: TypedDocumentNode<
  DeleteOneOffPaymentResult,
  DeleteOneOffPaymentMutationVariables
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
