import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Account } from '~/hooks/useAccount';
import { useNoteActions } from '~/hooks/useNoteActions';
import { startOfToday } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { followPayments } from '~/lib/notes';
import { PER_PERIOD, toPayments } from '~/lib/payments';
import { useNoteDialogStore } from '~/state/noteDialog';
import { findNotes, NoteSort, toNotes } from '../notesModel';

/* The notes board: search, sort, opening a note to write or change, and the actions */
export const useNotes = (account: Account) => {
  const [query, setQuery] = useState('');
  // Dated notes first, soonest first; the rest newest first
  const [sort, setSort] = useState<NoteSort>('date');
  // The dialog is opened from other pages too, so it lives in a store
  const { openNew, openEdit } = useNoteDialogStore(
    useShallow(s => ({ openNew: s.openNew, openEdit: s.openEdit }))
  );
  const actions = useNoteActions(account.id);
  const today = startOfToday();

  // Notes that follow a payment take its next date
  const all = followPayments(toNotes(account.notes), toPayments(account, today));
  const notes = findNotes(all, { query, sort, today });
  const searching = query.trim().length > 0;

  /* "Broadband · £32 a month", for a note linked to a payment that's still there */
  const paymentLabel = (id: string) => {
    const payment = account.recurringPayments?.find(item => item?.id === id);
    return payment
      ? `${payment.name} · ${formatMoney(payment.amount, { whole: true })} ${PER_PERIOD[payment.frequency]}`
      : null;
  };

  return {
    all,
    total: all.length,
    notes,
    today,
    paymentLabel,
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
