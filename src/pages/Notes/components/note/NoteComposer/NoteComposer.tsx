import { useEffect } from 'react';
import { useNoteComposerStore } from '~/state/noteComposer';
import { NotesBoard, useNoteDraft } from '../../../hooks';
import { NoteForm } from '../NoteForm';

const COMPOSER_ID = 'note-new';

// Room the floating mobile nav takes at the bottom of the screen
const NAV_SPACE = 96;

/* Brings the composer into view if it's off screen, and puts the cursor in it */
const reveal = () => {
  const text = document.getElementById(COMPOSER_ID);
  const form = text?.closest('form');
  if (!text || !form) return;
  const { top, bottom } = form.getBoundingClientRect();
  if (top < 0 || bottom > window.innerHeight - NAV_SPACE) {
    const still = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    form.scrollIntoView?.({ block: 'center', behavior: still ? 'auto' : 'smooth' });
  }
  text.focus({ preventScroll: true });
};

/* The new note at the top of the board. It stays open after saving, ready for the next one. */
export const NoteComposer = ({ board }: { board: NotesBoard }) => {
  const draft = useNoteDraft();
  // Each time a new note is asked for, from the board or the mobile nav
  const requests = useNoteComposerStore(s => s.requests);
  useEffect(reveal, [requests]);

  return (
    <NoteForm
      id={COMPOSER_ID}
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
