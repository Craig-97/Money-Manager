import { gql, TypedDocumentNode } from '@apollo/client';
import { Account } from '~/types';

export interface EditAccountResult {
  editAccount: { account: Account };
}

export interface EditAccountVariables {
  id?: string;
  account: { bankBalance?: number; monthlyIncome?: number };
}

export const EDIT_ACCOUNT_MUTATION: TypedDocumentNode<EditAccountResult, EditAccountVariables> =
  gql`
    mutation EditAccount($id: ID!, $account: EditAccountInput!) {
      editAccount(id: $id, account: $account) {
        account {
          bankBalance
          monthlyIncome
        }
        success
      }
    }
  `;
