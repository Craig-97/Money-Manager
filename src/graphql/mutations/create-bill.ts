import { gql, TypedDocumentNode } from '@apollo/client';
import { Bill } from '~/types';

export interface CreateBillResult {
  createBill: { bill: Bill };
}

export interface CreateBillVariables {
  bill: Bill;
}

export const CREATE_BILL_MUTATION: TypedDocumentNode<CreateBillResult, CreateBillVariables> = gql`
  mutation CreateBill($bill: BillInput!) {
    createBill(bill: $bill) {
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
