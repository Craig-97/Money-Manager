import { InfoNote } from '~/components/feedback/InfoNote';
import { Tile } from '~/components/ui/Tile';
import { formatBalance } from '~/lib/format';
import { Accounts } from '../../hooks';

/*
 * What counts in free to spend, which is the dashboard's bank balance. On mobile it's a smaller
 * card with the same figure, under the hero.
 */
export const CountedTile = ({
  accounts: model,
  compact = false
}: {
  accounts: Accounts;
  compact?: boolean;
}) => {
  const { totals, several } = model;
  const made = several ? 'your spending accounts' : 'your current account';
  const pill = `${totals.countedCount} ${totals.countedCount === 1 ? 'account' : 'accounts'}`;

  if (compact) {
    return (
      <Tile flat aria-labelledby="counted-title" className="gap-1.5 px-[18px] py-4">
        <div className="flex items-center justify-between gap-2">
          <h2 id="counted-title" className="text-[13px] font-bold text-muted">
            Counted in free to spend
          </h2>
          <span className="rounded-full bg-accent-soft px-3 py-1.5 text-xs font-bold whitespace-nowrap text-accent-text">
            {pill}
          </span>
        </div>
        <p className="num text-[30px] font-extrabold tracking-[-0.04em]">
          {formatBalance(totals.counted)}
        </p>
        <p className="text-xs leading-[1.45] font-semibold text-muted">
          The Bank balance on your dashboard: {made}, plus any savings you switch on.
        </p>
      </Tile>
    );
  }

  return (
    <Tile aria-labelledby="counted-title" className="gap-4 p-7 md:gap-[18px] md:p-7">
      <div className="flex items-center justify-between gap-3">
        <h2 id="counted-title" className="text-[15px] font-bold text-muted">
          Counted in free to spend
        </h2>
        <span className="rounded-full bg-accent-soft px-3.5 py-2 text-[13px] font-bold whitespace-nowrap text-accent-text">
          {pill}
        </span>
      </div>
      <p className="num text-5xl leading-none font-extrabold tracking-[-0.04em]">
        {formatBalance(totals.counted)}
      </p>
      <p className="text-sm leading-normal font-medium text-muted">
        This is the <b className="text-text">Bank balance</b> on your dashboard: {made}, plus any
        savings you switch on below.
      </p>
      <InfoNote className="mt-auto">
        Savings stay out unless you switch them on. Money you’ve put aside isn’t money to spend.
      </InfoNote>
    </Tile>
  );
};
