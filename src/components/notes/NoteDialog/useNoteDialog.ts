import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { NoteActions } from '~/hooks/useNoteActions';
import { BLANK_DRAFT, Note, sameDraft, toDraft } from '~/lib/notes';
import { useNoteDialogStore } from '~/state/noteDialog';
import { useNoteDraft } from './useNoteDraft';

/*
 * The note dialog: a new note, or one being changed. Each time it opens it starts afresh, from
 * nothing or from the note.
 */
export const useNoteDialog = ({
  notes,
  actions
}: {
  notes: readonly Note[];
  actions: NoteActions;
}) => {
  const { dialog, open, opened, close } = useNoteDialogStore(
    useShallow(s => ({ dialog: s.dialog, open: s.open, opened: s.opened, close: s.close }))
  );
  const note = dialog.view === 'edit' ? notes.find(item => item.id === dialog.noteId) : undefined;
  // A new note opened from a payment starts linked to it
  const start = note
    ? toDraft(note)
    : { ...BLANK_DRAFT, paymentId: (dialog.view === 'new' && dialog.paymentId) || '' };
  const draft = useNoteDraft(start);

  // A new opening: start from its note, or blank (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    draft.reset(start);
  }

  const save = async () => {
    const saved = await draft.save(changes =>
      note
        ? // Unchanged: nothing to send
          sameDraft(changes, toDraft(note))
          ? Promise.resolve(true)
          : actions.edit(note.id, changes)
        : actions.create(changes)
    );
    if (saved) close();
  };

  return {
    // A note that's gone, e.g. deleted elsewhere, has nothing to edit
    open: open && (dialog.view === 'new' || !!note),
    // From what was opened, so it reads the same while closing, even once the note is deleted
    editing: dialog.view === 'edit',
    draft,
    close,
    save: () => void save(),
    remove: () => {
      close();
      if (note) void actions.remove(note);
    }
  };
};
