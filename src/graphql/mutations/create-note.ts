import { gql, TypedDocumentNode } from '@apollo/client';
import { CreateNoteMutationVariables } from '../generated';
import { Note } from '~/types';

export interface CreateNoteResult {
  createNote: { note: Note };
}

export const CREATE_NOTE_MUTATION: TypedDocumentNode<
  CreateNoteResult,
  CreateNoteMutationVariables
> = gql`
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
