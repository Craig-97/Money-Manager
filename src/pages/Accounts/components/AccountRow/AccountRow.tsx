import { Switch } from '~/components/ui/Switch';
import { Account, accountLetter, accountMeta, isStale, updatedText } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { useAccountDialogStore } from '~/state/accountDialog';
import { AccountMenu } from '../AccountMenu';
import { PaidIntoTag } from '../PaidIntoTag';

interface AccountRowProps {
  account: Account;
  today: Date;
  // More than one account to spend from: say which one pay lands in
  several: boolean;
  onCounts: (counts: boolean) => void;
}

/*
 * Desktop: one account. Its name opens it to edit; the switch counts it in free to spend, which
 * where pay lands always is. How old the balance is sits under the name below 1101px.
 */
export const AccountRow = ({ account, today, several, onCounts }: AccountRowProps) => {
  const openEdit = useAccountDialogStore(s => s.openEdit);
  const stale = isStale(account, today);
  const updated = (
    <span
      className={cn(
        'inline-flex h-[26px] items-center rounded-full border px-2.5 text-xs font-bold whitespace-nowrap',
        stale ? 'border-transparent bg-warn-bg text-warn' : 'border-border bg-surface-2 text-muted'
      )}>
      {updatedText(account, today)}
    </span>
  );

  return (
    <div className="grid min-h-[72px] grid-cols-[minmax(0,1fr)_minmax(120px,auto)_150px_44px] items-center gap-x-4 rounded-2xl px-2 transition-colors hover:bg-hover wide:grid-cols-[minmax(0,1fr)_auto_minmax(130px,auto)_150px_44px]">
      <div className="flex min-w-0 items-center gap-3.5">
        <span
          aria-hidden="true"
          className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-extrabold">
          {accountLetter(account)}
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <button
              type="button"
              aria-label={`Edit ${account.name}`}
              aria-haspopup="dialog"
              onClick={() => openEdit(account.id)}
              className="-my-[11px] block max-w-full cursor-pointer rounded-lg py-[11px] text-left text-[15px] leading-[22px] font-bold [overflow-wrap:anywhere] hover:text-accent-text hover:underline hover:underline-offset-3">
              {account.name}
            </button>
            {several && account.paidInto ? <PaidIntoTag /> : null}
          </div>
          <p className="mt-0.5 text-xs font-semibold text-muted">
            {accountMeta(account, { several })}
          </p>
          <div className="mt-1.5 wide:hidden">{updated}</div>
        </div>
      </div>
      <div className="hidden wide:block">{updated}</div>
      <span className="text-right num text-[17px] font-extrabold whitespace-nowrap">
        {formatBalance(account.balance)}
      </span>
      <span className="flex items-center justify-end gap-2.5">
        {account.paidInto ? (
          <span className="text-xs font-semibold text-muted">Always counts</span>
        ) : (
          <>
            <span className="text-xs font-semibold text-muted">
              {account.counts ? 'Counts' : 'Kept out'}
            </span>
            <Switch
              checked={account.counts}
              onCheckedChange={onCounts}
              aria-label={`Count ${account.name} in free to spend`}
            />
          </>
        )}
      </span>
      <span className="flex justify-end">
        <AccountMenu account={account} several={several} onCounts={onCounts} />
      </span>
    </div>
  );
};
