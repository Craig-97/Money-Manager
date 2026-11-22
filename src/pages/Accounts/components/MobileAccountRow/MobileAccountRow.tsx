import { ChevronRight } from 'lucide-react';
import { AccountIcon, InterestStrip } from '~/components/accounts';
import { Account, interestLine, isStale, mobileAccountMeta, updatedText } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { useAccountViewStore } from '~/state/accountView';

const tagClasses =
  'inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-bold whitespace-nowrap';

interface MobileAccountRowProps {
  account: Account;
  today: Date;
  // More than one account to spend from: say which one pay lands in
  several: boolean;
}

/*
 * Mobile: one account, tapped to open its view in a sheet. What it's for shows under the name and
 * wraps, so a long one never pushes the balance off, however big that is. Tags say where pay lands,
 * how old the balance is and whether it counts in free to spend. A savings account's interest is a
 * full-width strip under the row, which opens its view too.
 */
export const MobileAccountRow = ({ account, today, several }: MobileAccountRowProps) => {
  const openView = useAccountViewStore(s => s.openFor);
  const stale = isStale(account, today);
  const interest = interestLine(account, today);

  return (
    <div className="flex flex-col">
      <button
        type="button"
        onClick={() => openView(account.id)}
        aria-haspopup="dialog"
        className="flex min-h-[72px] w-full cursor-pointer items-center gap-3 rounded-[18px] px-2.5 py-2 text-left transition-colors hover:bg-hover">
        <AccountIcon account={account} size="lg" />
        <span className="flex min-w-0 grow flex-col gap-[3px]">
          <span className="text-[15px] font-bold [overflow-wrap:anywhere]">{account.name}</span>
          <span className="text-xs leading-[1.35] font-semibold [overflow-wrap:anywhere] text-muted">
            {mobileAccountMeta(account, { several })}
          </span>
          <span className="flex flex-wrap gap-1.5">
            {several && account.paidInto ? (
              <span
                className={cn(tagClasses, 'border-transparent bg-accent-soft text-accent-text')}>
                Where you get paid
              </span>
            ) : null}
            <span
              className={cn(
                tagClasses,
                stale
                  ? 'border-transparent bg-warn-bg text-warn'
                  : 'border-border bg-surface-2 text-muted'
              )}>
              {updatedText(account, today)}
            </span>
            {account.paidInto ? null : (
              <span className={cn(tagClasses, 'border-border bg-surface-2 text-muted')}>
                {account.counts ? 'Counts' : 'Kept out'}
              </span>
            )}
          </span>
        </span>
        <span
          className={cn(
            'shrink-0 num text-[15px] font-extrabold whitespace-nowrap',
            // Below £0 is red, as it is before payday
            account.balance < 0 && 'text-expense'
          )}>
          {formatBalance(account.balance)}
        </span>
        <ChevronRight size={16} className="shrink-0 text-faint" aria-hidden="true" />
      </button>
      {interest ? (
        <InterestStrip
          line={interest}
          name={account.name}
          onClick={() => openView(account.id)}
          className="mx-2.5 mb-2 w-auto"
        />
      ) : null}
    </div>
  );
};
