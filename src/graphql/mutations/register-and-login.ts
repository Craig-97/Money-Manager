import { gql, TypedDocumentNode } from '@apollo/client';
import { RegisterAndLoginMutationVariables } from '../generated';
import { RegisterData } from '~/types';

export const REGISTER_AND_LOGIN_MUTATION: TypedDocumentNode<
  RegisterData,
  RegisterAndLoginMutationVariables
> = gql`
  mutation RegisterAndLogin($user: UserInput!) {
    registerAndLogin(user: $user) {
      user {
        id
        email
        firstName
        surname
      }
      token
    }
  }
`;
