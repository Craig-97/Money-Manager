import { gql, TypedDocumentNode } from '@apollo/client';
import { Note } from '~/types';

export interface DeleteNoteResult {
  deleteNote: { note: Note };
}

export interface DeleteNoteVariables {
  id: string;
}

export const DELETE_NOTE_MUTATION: TypedDocumentNode<DeleteNoteResult, DeleteNoteVariables> = gql`
  mutation DeleteNote($id: ID!) {
    deleteNote(id: $id) {
      note {
        id
      }
      success
    }
  }
`;
