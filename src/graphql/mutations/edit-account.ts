import { gql, TypedDocumentNode } from '@apollo/client';
import { EditAccountMutationVariables } from '../generated';
import { Account } from '~/types';

export interface EditAccountResult {
  editAccount: { account: Account };
}

export const EDIT_ACCOUNT_MUTATION: TypedDocumentNode<
  EditAccountResult,
  EditAccountMutationVariables
> = gql`
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
