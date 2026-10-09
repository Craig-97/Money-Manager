import { PageHeader } from '~/components/layout/PageHeader';
import { useAccount } from '~/hooks/useAccount';
import { NotesContent, NotesError, NotesSkeleton } from './components';
import { countNotes, toNotes } from './notesModel';

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
