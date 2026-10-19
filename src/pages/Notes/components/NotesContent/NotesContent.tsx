import { Budget } from '~/hooks/useBudget';
import { useNotes } from '../../hooks';
import { NotesList, NotesToolbar } from '../board';

/* The board once the budget has loaded. The note dialog opens over it from the app's layout. */
export const NotesContent = ({ budget }: { budget: Budget }) => {
  const board = useNotes(budget);
  return (
    <>
      <NotesToolbar board={board} />
      <NotesList board={board} />
    </>
  );
};
