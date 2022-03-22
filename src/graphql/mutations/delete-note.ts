import { gql } from '@apollo/client';

export const DELETE_NOTE_MUTATION = gql`
  mutation ($id: ID!) {
    deleteNote(id: $id) {
      note {
        id
      }
      success
    }
  }
`;
