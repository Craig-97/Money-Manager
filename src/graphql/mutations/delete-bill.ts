import { gql, TypedDocumentNode } from '@apollo/client';
import { Bill } from '~/types';

export interface DeleteBillResult {
  deleteBill: { bill: Bill };
}

export interface DeleteBillVariables {
  id: string;
}

export const DELETE_BILL_MUTATION: TypedDocumentNode<DeleteBillResult, DeleteBillVariables> = gql`
  mutation DeleteBill($id: ID!) {
    deleteBill(id: $id) {
      bill {
        id
      }
      success
    }
  }
`;
