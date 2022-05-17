import { gql } from '@apollo/client';

export const CREATE_USER_MUTATION = gql`
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
