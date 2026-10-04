import { useState } from 'react';
import { Account } from '~/hooks/useAccount';
import { findNotes, NoteSort, toNotes } from '../notesModel';
import { useNoteActions } from './useNoteActions';

/* The notes board: search, sort, the composer, which note is being edited, and the actions */
export const useNotes = (account: Account) => {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<NoteSort>('newest');
  const [composerOpen, setComposerOpen] = useState(false);
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
    openComposer: () => setComposerOpen(true),
    closeComposer: () => setComposerOpen(false),
    editingId,
    startEditing: (id: string) => setEditingId(id),
    stopEditing: () => setEditingId(null),
    actions
  };
};

export type NotesBoard = ReturnType<typeof useNotes>;
