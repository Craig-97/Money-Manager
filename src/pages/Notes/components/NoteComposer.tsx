import { NotesBoard, useNoteDraft } from '../hooks';
import { NoteForm } from './NoteForm';

/* The new note at the top of the board. It stays open after saving, ready for the next one. */
export const NoteComposer = ({ board }: { board: NotesBoard }) => {
  const draft = useNoteDraft();
  return (
    <NoteForm
      id="note-new"
      draft={draft}
      label="New note"
      saveLabel="Save note"
      cancelLabel="Cancel new note"
      placeholder="Start typing your note…"
      onSave={() => draft.save(board.actions.create)}
      onCancel={board.closeComposer}
    />
  );
};
