import { gql } from '@apollo/client';

export const CREATE_NOTE_MUTATION = gql`
  mutation ($note: NoteInput!) {
    createNote(note: $note) {
      note {
        id
        body
        createdAt
      }
      success
    }
  }
`;
