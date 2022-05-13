import { gql } from '@apollo/client';

export const LOGIN_QUERY = gql`
  query Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        firstName
        surname
        email
      }
      token
      tokenExpiration
    }
  }
`;
