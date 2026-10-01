import { gql, TypedDocumentNode } from '@apollo/client';
import { Note } from '~/types';

export interface EditNoteResult {
  editNote: { note: Note; success: boolean };
}

export interface EditNoteVariables {
  id: string;
  note: Note;
}

export const EDIT_NOTE_MUTATION: TypedDocumentNode<EditNoteResult, EditNoteVariables> = gql`
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
