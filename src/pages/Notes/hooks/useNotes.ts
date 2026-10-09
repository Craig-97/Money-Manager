import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Account } from '~/hooks/useAccount';
import { useNoteComposerStore } from '~/state/noteComposer';
import { findNotes, NoteSort, toNotes } from '../notesModel';
import { useNoteActions } from './useNoteActions';

/* The notes board: search, sort, the composer, which note is being edited, and the actions */
export const useNotes = (account: Account) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<NoteSort>('newest');
  // The composer can be opened from the mobile nav too, so it lives in a store
  const { composerOpen, openComposer, closeComposer } = useNoteComposerStore(
    useShallow(s => ({
      composerOpen: s.open,
      openComposer: s.openComposer,
      closeComposer: s.closeComposer
    }))
  );
  // Leaving the page puts the composer away, so it isn't open again on coming back
  useEffect(() => closeComposer, [closeComposer]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const actions = useNoteActions(account.id);

  const all = toNotes(account.notes);
  const notes = findNotes(all, query, sort);
  const searching = query.trim().length > 0;

  return {
    total: all.length,
    notes,
    query,
    setQuery,
    clearQuery: () => setQuery(''),
    searching,
    noResults: searching && notes.length === 0,
    // Nothing written yet, and the composer isn't open to write one
    empty: all.length === 0 && !composerOpen,
    sort,
    setSort,
    composerOpen,
    openComposer,
    closeComposer,
    editingId,
    startEditing: (id: string) => setEditingId(id),
    stopEditing: () => setEditingId(null),
    actions
  };
};

export type NotesBoard = ReturnType<typeof useNotes>;
