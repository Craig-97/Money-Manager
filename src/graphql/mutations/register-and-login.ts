import { gql } from '@apollo/client';

export const REGISTER_AND_LOGIN_MUTATION = gql`
  mutation ($user: UserInput!) {
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
