import { gql, TypedDocumentNode } from '@apollo/client';
import { LoginData } from '~/types';

export const LOGIN_QUERY: TypedDocumentNode<LoginData, { email: string; password: string }> = gql`
  query Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
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
