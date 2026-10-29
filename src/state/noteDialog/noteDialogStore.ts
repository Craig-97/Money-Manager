import { create } from 'zustand';
import { usePaymentNotesStore } from '../paymentNotes';

type NoteDialogView =
  // A new note; about this payment when it's opened from one
  { view: 'new'; paymentId?: string } | { view: 'edit'; noteId: string };

// Where closing goes back to: a payment's notes, and whether those came from its mobile sheet
interface BackTo {
  paymentId: string;
  fromSheet: boolean;
}

interface OpenOptions {
  backTo?: BackTo;
}

interface NoteDialogState {
  // What it shows. Closing leaves this as it was, so the dialog keeps its contents while it
  // animates away; the next opening replaces it.
  dialog: NoteDialogView;
  open: boolean;
  // Goes up each time it opens, so each opening starts from a fresh form
  opened: number;
  backTo: BackTo | null;
  openNew: () => void;
  // A new note about a payment, linked to it from the start
  openNewFor: (paymentId: string, options?: OpenOptions) => void;
  openEdit: (noteId: string, options?: OpenOptions) => void;
  close: () => void;
}

/*
 * Writing or changing a note: a dialog on desktop and a bottom sheet on mobile. It lives outside
 * the notes page so the mobile nav's add button can open it. Opened from a payment's notes, it goes
 * back to them however it closes: saved, deleted or cancelled.
 */
export const useNoteDialogStore = create<NoteDialogState>()((set, get) => ({
  dialog: { view: 'new' },
  open: false,
  opened: 0,
  backTo: null,
  openNew: () =>
    set(s => ({ dialog: { view: 'new' }, open: true, opened: s.opened + 1, backTo: null })),
  openNewFor: (paymentId, { backTo } = {}) =>
    set(s => ({
      dialog: { view: 'new', paymentId },
      open: true,
      opened: s.opened + 1,
      backTo: backTo ?? null
    })),
  openEdit: (noteId, { backTo } = {}) =>
    set(s => ({
      dialog: { view: 'edit', noteId },
      open: true,
      opened: s.opened + 1,
      backTo: backTo ?? null
    })),
  close: () => {
    const { backTo, open } = get();
    set({ open: false, backTo: null });
    if (open && backTo) {
      usePaymentNotesStore.getState().openFor(backTo.paymentId, { fromSheet: backTo.fromSheet });
    }
  }
}));
