import { CalendarDays } from 'lucide-react';
import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { tileLift } from '~/components/ui/Tile';
import { useBudget } from '~/hooks/useBudget';
import { formatMoney } from '~/lib/format';
import { paidText } from '~/lib/payday';
import { ForecastContent, ForecastSkeleton } from './components';

export const Forecast = () => {
  const { budget, loading, retry } = useBudget();

  return (
    <>
      <PageHeader
        title="Forecast"
        description="Where your balance is heading if you keep spending at this pace."
        actions={
          budget ? (
            <span
              className={`flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-semibold text-muted ${tileLift}`}>
              <CalendarDays size={16} aria-hidden="true" />
              {paidText(budget.payday)} ·{' '}
              <span className="num font-bold text-text">
                {formatMoney(budget.monthlyIncome, { whole: true })}
              </span>
            </span>
          ) : null
        }
      />
      {budget ? (
        <ForecastContent budget={budget} />
      ) : loading ? (
        <ForecastSkeleton />
      ) : (
        <BudgetError onRetry={retry} />
      )}
    </>
  );
};
