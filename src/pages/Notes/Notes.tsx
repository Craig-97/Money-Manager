import { BudgetError } from '~/components/feedback';
import { PageHeader } from '~/components/layout';
import { useBudget } from '~/hooks/useBudget';
import { plural } from '~/lib/format';
import { toNotes } from '~/lib/notes';
import { NotesContent, NotesSkeleton } from './components';

export const Notes = () => {
  const { budget, loading, retry } = useBudget();
  const count = budget ? plural(toNotes(budget.notes).length, 'note') : '–';

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
      {budget ? (
        <NotesContent budget={budget} />
      ) : loading ? (
        <NotesSkeleton />
      ) : (
        <BudgetError onRetry={retry} />
      )}
    </>
  );
};
