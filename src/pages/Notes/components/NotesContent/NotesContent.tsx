import { Account } from '~/hooks/useAccount';
import { useNotes } from '../../hooks';
import { NotesList, NotesToolbar } from '../board';
import { NoteDialog } from '../note';

/* The board once the account has loaded */
export const NotesContent = ({ account }: { account: Account }) => {
  const board = useNotes(account);
  return (
    <>
      <NotesToolbar board={board} />
      <NotesList board={board} />
      <NoteDialog board={board} />
    </>
  );
};
