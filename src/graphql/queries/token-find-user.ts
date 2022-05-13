import { gql } from '@apollo/client';

export const FIND_USER_QUERY = gql`
  query TokenFindUser {
    tokenFindUser {
      id
      email
      firstName
      surname
    }
  }
`;
