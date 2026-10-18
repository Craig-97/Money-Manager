import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Account } from '~/hooks/useAccount';
import { useNoteDialogStore } from '~/state/noteDialog';
import { findNotes, NoteSort, toNotes } from '../notesModel';
import { useNoteActions } from './useNoteActions';

/* The notes board: search, sort, opening a note to write or change, and the actions */
export const useNotes = (account: Account) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<NoteSort>('newest');
  // The dialog can be opened from the mobile nav too, so it lives in a store
  const { openNew, openEdit, close } = useNoteDialogStore(
    useShallow(s => ({ openNew: s.openNew, openEdit: s.openEdit, close: s.close }))
  );
  // Leaving the page puts the dialog away, so it isn't open again on coming back
  useEffect(() => close, [close]);
  const actions = useNoteActions(account.id);

  const all = toNotes(account.notes);
  const notes = findNotes(all, query, sort);
  const searching = query.trim().length > 0;

  return {
    all,
    total: all.length,
    notes,
    query,
    setQuery,
    clearQuery: () => setQuery(''),
    searching,
    noResults: searching && notes.length === 0,
    empty: all.length === 0,
    sort,
    setSort,
    openNew,
    openEdit,
    actions
  };
};

export type NotesBoard = ReturnType<typeof useNotes>;
