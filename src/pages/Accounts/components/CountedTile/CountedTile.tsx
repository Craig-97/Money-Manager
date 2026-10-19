import { Info } from 'lucide-react';
import { Tile } from '~/components/ui/Tile';
import { formatBalance } from '~/lib/format';
import { Accounts } from '../../hooks';

/* Desktop: what counts in free to spend, which is the dashboard's bank balance */
export const CountedTile = ({ accounts: model }: { accounts: Accounts }) => {
  const { totals } = model;
  return (
    <Tile aria-labelledby="counted-title" className="gap-4 p-7 md:gap-[18px] md:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 id="counted-title" className="text-[17px] font-extrabold tracking-[-0.02em]">
          Counted in free to spend
        </h2>
        <span className="rounded-full bg-accent-soft px-3.5 py-2 text-[13px] font-bold whitespace-nowrap text-accent-text">
          {totals.countedCount} {totals.countedCount === 1 ? 'account' : 'accounts'}
        </span>
      </div>
      <p className="num text-5xl leading-none font-extrabold tracking-[-0.04em]">
        {formatBalance(totals.counted)}
      </p>
      <p className="text-sm leading-normal font-medium text-muted">
        This is the <b className="text-text">Bank balance</b> on your dashboard: your current
        account, plus any savings you switch on below.
      </p>
      <p className="mt-auto flex items-start gap-2.5 rounded-2xl border border-border bg-surface-2 px-3.5 py-3 text-[13px] leading-[1.45] font-semibold text-muted">
        <Info size={16} className="mt-px shrink-0 text-accent-text" aria-hidden="true" />
        Savings stay out unless you switch them on. Money you’ve put aside isn’t money to spend.
      </p>
    </Tile>
  );
};
