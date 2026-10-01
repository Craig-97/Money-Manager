import { gql, TypedDocumentNode } from '@apollo/client';
import { EditNoteMutationVariables } from '../generated';
import { Note } from '~/types';

export interface EditNoteResult {
  editNote: { note: Note; success: boolean };
}

export const EDIT_NOTE_MUTATION: TypedDocumentNode<EditNoteResult, EditNoteMutationVariables> = gql`
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
