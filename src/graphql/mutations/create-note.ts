import { gql, TypedDocumentNode } from '@apollo/client';
import { Note } from '~/types';

export interface CreateNoteResult {
  createNote: { note: Note };
}

export interface CreateNoteVariables {
  note: Note;
}

export const CREATE_NOTE_MUTATION: TypedDocumentNode<CreateNoteResult, CreateNoteVariables> = gql`
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
