import { useMutation } from '@apollo/client/react';
import { addNote, removeFromBudget } from '~/graphql/cache';
import { CreateNoteDocument, DeleteNoteDocument, UpdateNoteDocument } from '~/graphql/generated';
import { getApiErrorMessage } from '~/lib/errors';
import { Note, NoteDraft, noteInput, toDraft } from '~/lib/notes';
import { showToast } from '~/state/toast';

const showError = (error: unknown) =>
  showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });

/* Adding, changing and deleting notes. Each returns whether it worked. */
export const useNoteActions = (budgetId: string) => {
  const [createNote] = useMutation(CreateNoteDocument);
  const [updateNote] = useMutation(UpdateNoteDocument);
  const [deleteNote] = useMutation(DeleteNoteDocument);

  const create = async (draft: NoteDraft) => {
    try {
      await createNote({
        variables: { input: { budgetId, ...noteInput(draft) } },
        update: (cache, { data }) => {
          const note = data?.createNote.note;
          if (note) addNote(cache, { budget: budgetId, note });
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
      await updateNote({ variables: { id, input: noteInput(draft) } });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  /* Deletes straight away; Undo adds the same note back as a new one */
  const remove = async (note: Note) => {
    try {
      await deleteNote({
        variables: { id: note.id },
        update: cache =>
          removeFromBudget(cache, { budget: budgetId, field: 'notes', ids: [note.id] })
      });
      showToast({
        message: 'Note deleted',
        action: { label: 'Undo', onClick: () => void create(toDraft(note)) }
      });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  return { create, edit, remove };
};

export type NoteActions = ReturnType<typeof useNoteActions>;
