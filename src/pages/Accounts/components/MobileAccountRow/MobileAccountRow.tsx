import { ChevronRight } from 'lucide-react';
import { Account, accountLetter, accountMeta, isStale, updatedText } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { useAccountDialogStore } from '~/state/accountDialog';

const tagClasses =
  'inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-bold whitespace-nowrap';

interface MobileAccountRowProps {
  account: Account;
  today: Date;
  // More than one account to spend from: say which one pay lands in
  several: boolean;
}

/*
 * Mobile: one account, tapped to edit in a sheet. Its kind and what it's for show under the name
 * and wrap, so a long one never pushes the balance off, however big that is. Tags say where pay
 * lands, how old the balance is and whether it counts in free to spend.
 */
export const MobileAccountRow = ({ account, today, several }: MobileAccountRowProps) => {
  const openEdit = useAccountDialogStore(s => s.openEdit);
  const stale = isStale(account, today);

  return (
    <button
      type="button"
      onClick={() => openEdit(account.id)}
      aria-label={`Edit ${account.name}`}
      aria-haspopup="dialog"
      className="flex min-h-[72px] w-full cursor-pointer items-center gap-3 rounded-[18px] px-2.5 py-2 text-left transition-colors hover:bg-hover">
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-[13px] border border-border bg-surface-2 text-[15px] font-extrabold">
        {accountLetter(account)}
      </span>
      <span className="flex min-w-0 grow flex-col gap-[3px]">
        <span className="text-[15px] font-bold [overflow-wrap:anywhere]">{account.name}</span>
        <span className="text-xs leading-[1.35] font-semibold [overflow-wrap:anywhere] text-muted">
          {accountMeta(account, { several })}
        </span>
        <span className="flex flex-wrap gap-1.5">
          {several && account.paidInto ? (
            <span className={cn(tagClasses, 'border-transparent bg-accent-soft text-accent-text')}>
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
      <span className="shrink-0 num text-[15px] font-extrabold whitespace-nowrap">
        {formatBalance(account.balance)}
      </span>
      <ChevronRight size={16} className="shrink-0 text-faint" aria-hidden="true" />
    </button>
  );
};
