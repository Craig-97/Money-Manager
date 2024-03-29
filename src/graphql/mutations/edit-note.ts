import { gql } from '@apollo/client';

export const EDIT_NOTE_MUTATION = gql`
  mutation EditNote($id: ID!, $note: NoteInput!) {
    editNote(id: $id, note: $note) {
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
