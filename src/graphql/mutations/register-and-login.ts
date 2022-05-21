import { gql } from '@apollo/client';

export const REGISTER_AND_LOGIN_MUTATION = gql`
  mutation ($user: UserInput!) {
    createUser(user: $user) {
      user {
        email
        firstName
        surname
      }
      success
    }
  }
`;
