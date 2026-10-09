import { create } from 'zustand';

interface NoteComposerState {
  open: boolean;
  // Goes up each time a new note is asked for, so an open composer can be brought back into view
  requests: number;
  openComposer: () => void;
  closeComposer: () => void;
}

/*
 * The new note form at the top of the notes board. It lives outside the page so the mobile nav's
 * add button can open it.
 */
export const useNoteComposerStore = create<NoteComposerState>()(set => ({
  open: false,
  requests: 0,
  openComposer: () => set(state => ({ open: true, requests: state.requests + 1 })),
  closeComposer: () => set({ open: false })
}));
