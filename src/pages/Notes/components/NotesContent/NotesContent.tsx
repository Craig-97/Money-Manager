import { Account } from '~/hooks/useAccount';
import { useNotes } from '../../hooks';
import { NotesList, NotesToolbar } from '../board';

/* The board once the account has loaded */
export const NotesContent = ({ account }: { account: Account }) => {
  const board = useNotes(account);
  return (
    <>
      <NotesToolbar board={board} />
      <NotesList board={board} />
    </>
  );
};
