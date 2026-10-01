import { gql, TypedDocumentNode } from '@apollo/client';
import { CreateBillMutationVariables } from '../generated';
import { Bill } from '~/types';

export interface CreateBillResult {
  createBill: { bill: Bill };
}

export const CREATE_BILL_MUTATION: TypedDocumentNode<
  CreateBillResult,
  CreateBillMutationVariables
> = gql`
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
