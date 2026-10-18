import { create } from 'zustand';

type NoteDialogView = { view: 'closed' } | { view: 'new' } | { view: 'edit'; noteId: string };

interface NoteDialogState {
  dialog: NoteDialogView;
  // Goes up each time it opens, so each opening starts from a fresh form
  opened: number;
  openNew: () => void;
  openEdit: (noteId: string) => void;
  close: () => void;
}

/*
 * Writing or changing a note: a dialog on desktop and a bottom sheet on mobile. It lives outside
 * the notes page so the mobile nav's add button can open it.
 */
export const useNoteDialogStore = create<NoteDialogState>()(set => ({
  dialog: { view: 'closed' },
  opened: 0,
  openNew: () => set(s => ({ dialog: { view: 'new' }, opened: s.opened + 1 })),
  openEdit: noteId => set(s => ({ dialog: { view: 'edit', noteId }, opened: s.opened + 1 })),
  close: () => set({ dialog: { view: 'closed' } })
}));
