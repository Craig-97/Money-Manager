import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { FirstCycle } from '../../../setupModel';

/*
 * Mobile's running total on the payment steps, standing in for the summary beside the form on
 * desktop. The bar fills with how much of the balance is already spoken for.
 */
export const FreeToSpendStrip = ({ firstCycle }: { firstCycle: FirstCycle }) => {
  const { cycleEnd, freeToSpend, spokenForPercent } = firstCycle;

  return (
    <div className="flex items-center justify-between gap-2.5 rounded-[20px] border border-border bg-surface px-3.5 py-3">
      <p className="flex flex-col gap-0.5">
        <span className="text-xs text-muted">
          Free to spend · until {formatShortDate(cycleEnd)}
        </span>
        <span className={cn('num text-lg font-extrabold', freeToSpend < 0 && 'text-expense')}>
          {formatBalance(freeToSpend)}
        </span>
      </p>
      <div aria-hidden="true" className="h-1.5 w-24 shrink-0 overflow-hidden rounded-full bg-track">
        <div className="h-full rounded-full bg-expense" style={{ width: `${spokenForPercent}%` }} />
      </div>
    </div>
  );
};
