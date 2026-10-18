import { create } from 'zustand';

type NoteDialogView = { view: 'new' } | { view: 'edit'; noteId: string };

interface NoteDialogState {
  // What it shows. Closing leaves this as it was, so the dialog keeps its contents while it
  // animates away; the next opening replaces it.
  dialog: NoteDialogView;
  open: boolean;
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
  dialog: { view: 'new' },
  open: false,
  opened: 0,
  openNew: () => set(s => ({ dialog: { view: 'new' }, open: true, opened: s.opened + 1 })),
  openEdit: noteId =>
    set(s => ({ dialog: { view: 'edit', noteId }, open: true, opened: s.opened + 1 })),
  close: () => set({ open: false })
}));
