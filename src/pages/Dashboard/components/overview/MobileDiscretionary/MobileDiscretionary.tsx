import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { Dashboard } from '../../../hooks';
import { IncomeSplit } from '../IncomeSplit';
import { OverdrawnPill } from '../OverdrawnPill';

/* Mobile: what's left of income after recurring payments */
export const MobileDiscretionary = ({ dashboard }: { dashboard: Dashboard }) => {
  const { summary, isEmpty } = dashboard;
  const overspent = summary.discretionary < 0;

  return (
    <article className="flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="flex flex-wrap items-center gap-2 text-base font-extrabold tracking-[-0.02em]">
          Discretionary income
          {overspent ? <OverdrawnPill>Overspent</OverdrawnPill> : null}
        </h2>
        <p className="text-xs font-semibold whitespace-nowrap text-muted">
          <span
            className={cn(
              'num text-lg font-extrabold',
              overspent ? 'text-expense' : 'text-accent-text'
            )}>
            {formatBalance(summary.discretionary)}
          </span>{' '}
          /mo
        </p>
      </div>
      {isEmpty ? (
        <p className="text-[13px] font-medium text-muted">Shown once you add income and payments</p>
      ) : (
        <IncomeSplit share={summary.recurringShare} compact />
      )}
    </article>
  );
};
