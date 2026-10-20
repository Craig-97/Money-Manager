import { ChevronRight } from 'lucide-react';
import { Account, accountLetter, isStale, updatedText } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { useAccountDialogStore } from '~/state/accountDialog';
import { PaidIntoTag } from '../PaidIntoTag';

interface MobileAccountRowProps {
  account: Account;
  today: Date;
  // More than one account to spend from: say which one pay lands in
  several: boolean;
}

/*
 * Mobile: one account, tapped to edit in a sheet. What it's for shows under the name and wraps, so
 * a long one never pushes the balance off, however big that is.
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
      className="flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-[18px] px-2.5 py-2 text-left transition-colors hover:bg-hover">
      <span
        aria-hidden="true"
        className="inline-flex size-10 shrink-0 items-center justify-center rounded-[13px] border border-border bg-surface-2 text-[15px] font-extrabold">
        {accountLetter(account)}
      </span>
      <span className="flex min-w-0 grow flex-col gap-[3px]">
        <span className="text-[15px] font-bold [overflow-wrap:anywhere]">{account.name}</span>
        {several && account.paidInto ? <PaidIntoTag /> : null}
        {account.purpose ? (
          <span className="text-xs leading-[1.35] font-semibold [overflow-wrap:anywhere] text-muted">
            {account.purpose}
          </span>
        ) : null}
        <span
          className={cn(
            'inline-flex h-5 items-center self-start rounded-full border px-2 text-[10px] font-bold',
            stale
              ? 'border-transparent bg-warn-bg text-warn'
              : 'border-border bg-surface-2 text-muted'
          )}>
          {updatedText(account, today)}
        </span>
      </span>
      <span className="shrink-0 num text-[15px] font-extrabold whitespace-nowrap">
        {formatBalance(account.balance)}
      </span>
      <ChevronRight size={16} className="shrink-0 text-faint" aria-hidden="true" />
    </button>
  );
};
