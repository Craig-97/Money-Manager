import { gql, TypedDocumentNode } from '@apollo/client';
import { DeleteNoteMutationVariables } from '../generated';
import { Note } from '~/types';

export interface DeleteNoteResult {
  deleteNote: { note: Note };
}

export const DELETE_NOTE_MUTATION: TypedDocumentNode<
  DeleteNoteResult,
  DeleteNoteMutationVariables
> = gql`
  mutation DeleteNote($id: ID!) {
    deleteNote(id: $id) {
      note {
        id
      }
      success
    }
  }
`;
