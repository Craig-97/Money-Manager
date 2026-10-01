import { gql, TypedDocumentNode } from '@apollo/client';
import { TokenFindUserQueryVariables } from '../generated';
import { FindUserData } from '~/types';

export const FIND_USER_QUERY: TypedDocumentNode<FindUserData, TokenFindUserQueryVariables> = gql`
  query TokenFindUser {
    tokenFindUser {
      id
      email
      firstName
      surname
    }
  }
`;
