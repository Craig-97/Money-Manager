import { gql, TypedDocumentNode } from '@apollo/client';
import { OneOffPayment } from '~/types';

export interface EditOneOffPaymentResult {
  editOneOffPayment: { oneOffPayment: OneOffPayment; success: boolean };
}

export interface EditOneOffPaymentVariables {
  id: string;
  oneOffPayment: OneOffPayment;
}

export const EDIT_ONE_OFF_PAYMENT_MUTATION: TypedDocumentNode<
  EditOneOffPaymentResult,
  EditOneOffPaymentVariables
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
