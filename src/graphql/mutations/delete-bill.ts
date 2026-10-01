import { gql, TypedDocumentNode } from '@apollo/client';
import { DeleteBillMutationVariables } from '../generated';
import { Bill } from '~/types';

export interface DeleteBillResult {
  deleteBill: { bill: Bill };
}

export const DELETE_BILL_MUTATION: TypedDocumentNode<
  DeleteBillResult,
  DeleteBillMutationVariables
> = gql`
  mutation DeleteBill($id: ID!) {
    deleteBill(id: $id) {
      bill {
        id
      }
      success
    }
  }
`;
