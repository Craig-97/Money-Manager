import { gql, TypedDocumentNode } from '@apollo/client';
import { FindUserData } from '~/types';

export const FIND_USER_QUERY: TypedDocumentNode<FindUserData, Record<string, never>> = gql`
  query TokenFindUser {
    tokenFindUser {
      id
      email
      firstName
      surname
    }
  }
`;
