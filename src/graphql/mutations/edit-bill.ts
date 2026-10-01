import { gql, TypedDocumentNode } from '@apollo/client';
import { Bill } from '~/types';

export interface EditBillResult {
  editBill: { bill: Bill; success: boolean };
}

export interface EditBillVariables {
  id: string;
  bill: Bill;
}

export const EDIT_BILL_MUTATION: TypedDocumentNode<EditBillResult, EditBillVariables> = gql`
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
