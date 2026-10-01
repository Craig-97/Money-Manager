import { gql, TypedDocumentNode } from '@apollo/client';
import { EditOneOffPaymentMutationVariables } from '../generated';
import { OneOffPayment } from '~/types';

export interface EditOneOffPaymentResult {
  editOneOffPayment: { oneOffPayment: OneOffPayment; success: boolean };
}

export const EDIT_ONE_OFF_PAYMENT_MUTATION: TypedDocumentNode<
  EditOneOffPaymentResult,
  EditOneOffPaymentMutationVariables
> = gql`
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
