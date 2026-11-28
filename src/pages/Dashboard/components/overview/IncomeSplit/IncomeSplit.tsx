import { cn } from '~/lib/cn';

/* The recurring and discretionary split of monthly income, as a bar with its key */
export const IncomeSplit = ({ share, compact = false }: { share: number; compact?: boolean }) => (
  <div className="flex flex-col gap-2.5">
    <div
      role="img"
      aria-label={`Recurring ${share.toFixed(1)}%, discretionary ${(100 - share).toFixed(1)}% of monthly income`}
      className={cn(
        'flex overflow-hidden rounded-full',
        compact ? 'h-2.5 gap-[3px]' : 'h-3 gap-1'
      )}>
      <div className="rounded-full bg-border-strong" style={{ width: `${share.toFixed(1)}%` }} />
      <div className="grow rounded-full bg-accent" />
    </div>
    <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-muted">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="size-2.5 rounded bg-border-strong" />
        Recurring <span className="num font-extrabold text-text">{share.toFixed(1)}%</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="size-2.5 rounded bg-accent" />
        Discretionary{' '}
        <span className="num font-extrabold text-text">{(100 - share).toFixed(1)}%</span>
      </span>
    </div>
  </div>
);
