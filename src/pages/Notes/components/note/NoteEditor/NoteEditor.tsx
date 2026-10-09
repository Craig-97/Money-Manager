import { NotesBoard, useNoteDraft } from '../../../hooks';
import { Note } from '../../../notesModel';
import { NoteForm } from '../NoteForm';

/* A note being changed in place: starts from its text and colour */
export const NoteEditor = ({ note, board }: { note: Note; board: NotesBoard }) => {
  const draft = useNoteDraft({ body: note.body, color: note.color });
  return (
    <NoteForm
      id={`note-edit-${note.id}`}
      draft={draft}
      label="Edit note"
      saveLabel="Save changes"
      cancelLabel="Cancel editing"
      onSave={() =>
        draft.save(async changes =>
          // Unchanged: nothing to send
          changes.body === note.body && changes.color === note.color
            ? true
            : board.actions.edit(note.id, changes)
        )
      }
      onSaved={board.stopEditing}
      onCancel={board.stopEditing}
    />
  );
};
