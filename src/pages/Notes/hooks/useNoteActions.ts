import { useMutation } from '@apollo/client/react';
import { addNote, removeFromAccount } from '~/graphql/cache';
import {
  CreateNoteDocument,
  DeleteNoteDocument,
  NoteColor,
  UpdateNoteDocument
} from '~/graphql/generated';
import { getApiErrorMessage } from '~/lib/errors';
import { showToast } from '~/state/toast';
import { Note } from '../notesModel';

interface NoteDraft {
  body: string;
  color: NoteColor;
}

const showError = (error: unknown) =>
  showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });

/* Adding, changing and deleting notes. Each returns whether it worked. */
export const useNoteActions = (accountId: string) => {
  const [createNote] = useMutation(CreateNoteDocument);
  const [updateNote] = useMutation(UpdateNoteDocument);
  const [deleteNote] = useMutation(DeleteNoteDocument);

  const create = async (draft: NoteDraft) => {
    try {
      await createNote({
        variables: { input: { accountId, ...draft } },
        update: (cache, { data }) => {
          const note = data?.createNote.note;
          if (note) addNote(cache, accountId, note);
        }
      });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const edit = async (id: string, draft: NoteDraft) => {
    try {
      await updateNote({ variables: { id, input: draft } });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  /* Deletes straight away; Undo adds the same text and colour back as a new note */
  const remove = async (note: Note) => {
    try {
      await deleteNote({
        variables: { id: note.id },
        update: cache => removeFromAccount(cache, accountId, 'notes', [note.id])
      });
      showToast({
        message: 'Note deleted',
        action: {
          label: 'Undo',
          onClick: () => void create({ body: note.body, color: note.color })
        }
      });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  return { create, edit, remove };
};
