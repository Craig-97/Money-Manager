import { gql, TypedDocumentNode } from '@apollo/client';
import { RegisterData } from '~/types';

export interface RegisterAndLoginVariables {
  user: { email: string; password: string; firstName: string; surname: string };
}

export const REGISTER_AND_LOGIN_MUTATION: TypedDocumentNode<
  RegisterData,
  RegisterAndLoginVariables
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
