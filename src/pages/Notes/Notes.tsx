import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { useBudget } from '~/hooks/useBudget';
import { NotesContent, NotesSkeleton } from './components';
import { countNotes, toNotes } from './notesModel';

export const Notes = () => {
  const { budget, loading, retry } = useBudget();
  const count = budget ? countNotes(toNotes(budget.notes).length) : '–';

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
