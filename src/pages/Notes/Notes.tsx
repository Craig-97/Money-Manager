import { PageHeader } from '~/components/layout/PageHeader';
import { Account, useAccount } from '~/hooks/useAccount';
import {
  NoteCard,
  NoteComposer,
  noteGridClasses,
  NotesEmpty,
  NotesError,
  NotesNoResults,
  NotesSkeleton,
  NotesToolbar
} from './components';
import { NotesBoard, useNotes } from './hooks';
import { countNotes, toNotes } from './notesModel';

const NotesList = ({ board }: { board: NotesBoard }) => {
  if (board.empty) return <NotesEmpty onAdd={board.openComposer} />;
  return (
    <>
      <section aria-label="Notes" className={noteGridClasses}>
        {board.composerOpen ? <NoteComposer board={board} /> : null}
        {board.notes.map(note => (
          <NoteCard key={note.id} note={note} board={board} />
        ))}
      </section>
      {board.noResults ? <NotesNoResults query={board.query} onClear={board.clearQuery} /> : null}
    </>
  );
};

const NotesContent = ({ account }: { account: Account }) => {
  const board = useNotes(account);
  return (
    <>
      <NotesToolbar board={board} />
      <NotesList board={board} />
    </>
  );
};

export const Notes = () => {
  const { account, loading, retry } = useAccount();
  const count = account ? countNotes(toNotes(account.notes).length) : '–';

  return (
    <>
      <PageHeader
        title="Notes"
        titleNote={count}
        description={
          <>
            Quick reminders that live alongside your money ·{' '}
            <span className="num font-bold text-text">{count}</span>
          </>
        }
      />
      {account ? (
        <NotesContent account={account} />
      ) : loading ? (
        <NotesSkeleton />
      ) : (
        <NotesError onRetry={retry} />
      )}
    </>
  );
};
