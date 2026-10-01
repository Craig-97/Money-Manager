import { gql, TypedDocumentNode } from '@apollo/client';
import { LoginQueryVariables } from '../generated';
import { LoginData } from '~/types';

export const LOGIN_QUERY: TypedDocumentNode<LoginData, LoginQueryVariables> = gql`
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
