import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';

/* The two lines on the chart: at the chosen spend, and recurring payments only */
export const Legend = ({
  spend,
  recurring,
  compact = false
}: {
  spend: number;
  recurring: number;
  compact?: boolean;
}) => (
  <div
    className={cn(
      'flex flex-wrap font-semibold text-muted',
      compact ? 'gap-3.5 text-xs' : 'gap-4 text-[13px]'
    )}>
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className="h-1 w-4 rounded-full bg-accent md:w-[18px]" />
      <span>
        At <span className="num text-text">{formatMoney(spend, { whole: true })}</span>/mo
      </span>
    </span>
    <span className="inline-flex items-center gap-2">
      <span
        aria-hidden="true"
        className="h-0 w-4 border-t-2 border-dashed border-faint md:w-[18px]"
      />
      Recurring only
      {compact ? null : <span className="num">({formatMoney(recurring, { whole: true })}/mo)</span>}
    </span>
  </div>
);
