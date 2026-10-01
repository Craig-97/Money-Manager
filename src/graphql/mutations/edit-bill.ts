import { gql, TypedDocumentNode } from '@apollo/client';
import { EditBillMutationVariables } from '../generated';
import { Bill } from '~/types';

export interface EditBillResult {
  editBill: { bill: Bill; success: boolean };
}

export const EDIT_BILL_MUTATION: TypedDocumentNode<EditBillResult, EditBillMutationVariables> = gql`
  mutation EditBill($id: ID!, $bill: BillInput!) {
    editBill(id: $id, bill: $bill) {
      bill {
        id
        name
        amount
        paid
      }
      success
    }
  }
`;
