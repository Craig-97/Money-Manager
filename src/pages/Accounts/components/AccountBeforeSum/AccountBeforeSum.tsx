import { AccountBeforePayday } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance, formatMoney } from '~/lib/format';

/*
 * An account's sum before payday: its balance, less what goes out, leaving what's left. Across a
 * wide row as three columns; otherwise in three boxes under the name. An overdrawn balance is red,
 * as Left is when it's below £0.
 */
export const AccountBeforeSum = ({
  row,
  across
}: {
  row: AccountBeforePayday;
  across: boolean;
}) => {
  const amount = 'num font-extrabold whitespace-nowrap';
  const balance = cn(amount, row.account.balance < 0 && 'text-expense');
  const left = cn(amount, row.left < 0 && 'text-expense');

  if (across) {
    const column = 'flex w-[130px] shrink-0 flex-col items-end gap-0.5';
    const operator = 'w-3.5 shrink-0 text-center font-bold text-muted';
    return (
      <>
        <span className={column}>
          <span className="text-xs text-muted">Balance</span>
          <span className={cn(balance, 'text-base')}>{formatBalance(row.account.balance)}</span>
        </span>
        <span aria-hidden="true" className={operator}>
          −
        </span>
        <span className={column}>
          <span className="text-xs text-muted">Goes out</span>
          <span className={cn(amount, 'text-base')}>{formatMoney(row.goesOut)}</span>
        </span>
        <span aria-hidden="true" className={operator}>
          =
        </span>
        <span className={column}>
          <span className="text-xs text-accent-text">Left at payday</span>
          <span className={cn(left, 'text-base')}>{formatBalance(row.left)}</span>
        </span>
      </>
    );
  }

  const box = 'flex min-w-0 flex-col gap-1 rounded-2xl px-2.5 py-2';
  const grey = cn(box, 'border border-border bg-surface-2');
  return (
    <span className="grid grid-cols-3 gap-1.5">
      <span className={grey}>
        <span className="text-[11px] font-bold text-muted">Balance</span>
        <span className={cn(balance, 'text-[13px]')}>{formatBalance(row.account.balance)}</span>
      </span>
      <span className={grey}>
        <span className="text-[11px] font-bold text-muted">− Goes out</span>
        <span className={cn(amount, 'text-[13px]')}>{formatMoney(row.goesOut)}</span>
      </span>
      <span className={cn(box, 'bg-accent-soft')}>
        <span className="text-[11px] font-bold text-accent-text">= Left</span>
        <span className={cn(left, 'text-[13px]')}>{formatBalance(row.left)}</span>
      </span>
    </span>
  );
};
