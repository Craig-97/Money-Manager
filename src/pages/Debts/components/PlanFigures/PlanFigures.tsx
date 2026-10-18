import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { PayoffPlan } from '../../hooks';

const cardClasses =
  'flex min-w-0 flex-col gap-1 rounded-[18px] border border-border bg-surface-2 p-4';

/* When the plan clears everything, the interest along the way, and on desktop what it costs a month */
export const PlanFigures = ({ plan, compact = false }: { plan: PayoffPlan; compact?: boolean }) => {
  const { figures } = plan;

  return (
    <div
      role="group"
      aria-label="This plan"
      aria-live="polite"
      className={cn('grid gap-2.5', compact ? 'grid-cols-2' : 'grid-cols-3')}>
      <div className={cardClasses}>
        <span className="text-[13px] font-semibold text-muted">Debt-free</span>
        <span className="num text-[22px] leading-tight font-extrabold tracking-[-0.02em]">
          {figures.freeBy}
        </span>
        <span className="text-xs font-semibold text-muted">{figures.sooner}</span>
      </div>
      <div className={cardClasses}>
        <span className="text-[13px] font-semibold text-muted">
          {compact ? 'Interest to pay' : 'Interest still to pay'}
        </span>
        <span className="num text-[22px] leading-tight font-extrabold tracking-[-0.02em]">
          {formatMoney(figures.interest, { whole: true })}
        </span>
        <span
          className={cn(
            'text-xs font-semibold',
            figures.saved === 'Same as now' ? 'text-muted' : 'text-income'
          )}>
          {figures.saved}
        </span>
      </div>
      {compact ? null : (
        <div className={cardClasses}>
          <span className="text-[13px] font-semibold text-muted">Each month</span>
          <span className="num text-[22px] leading-tight font-extrabold tracking-[-0.02em]">
            {formatMoney(figures.monthly, { whole: true })}
          </span>
          <span className="text-xs font-semibold text-muted">{figures.monthlySub}</span>
        </div>
      )}
    </div>
  );
};
