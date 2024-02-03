import { gql } from '@apollo/client';

export const CREATE_NOTE_MUTATION = gql`
  mutation CreateNote($note: NoteInput!) {
    createNote(note: $note) {
      note {
        id
        body
        createdAt
        updatedAt
      }
      success
    }
  }
`;
