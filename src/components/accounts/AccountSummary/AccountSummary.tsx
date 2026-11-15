import { ReactNode } from 'react';
import { Account, accountLetter, isSpending, isStale, updatedText } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { summaryCardClasses } from '../../payments';

interface AccountSummaryProps {
  account: Account;
  today: Date;
  // In a small dialog it says which account, as the title says what the dialog does
  named?: boolean;
  // Under the balance in the view, e.g. whether it counts in free to spend
  children?: ReactNode;
}

/* An account's grey card: its balance and how old that is, as the debt's and payment's cards are */
export const AccountSummary = ({
  account,
  today,
  named = false,
  children
}: AccountSummaryProps) => {
  const stale = isStale(account, today);
  const updated = updatedText(account, today);

  return (
    <div className={summaryCardClasses}>
      <span
        aria-hidden="true"
        className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-sm font-extrabold">
        {accountLetter(account)}
      </span>
      <div className="min-w-0 flex-1">
        {named ? <p className="text-[15px] font-extrabold">{account.name}</p> : null}
        <p
          className={cn(
            'num font-extrabold',
            named ? 'mt-0.5 text-[13px]' : 'text-lg',
            account.balance < 0 && 'text-expense'
          )}>
          {formatBalance(account.balance)}
        </p>
        <p className={cn('mt-0.5 text-xs font-semibold', stale ? 'text-warn' : 'text-muted')}>
          {isSpending(account) ? 'Spending' : 'Savings'} · {updated}
        </p>
      </div>
      {children ? <div className="flex basis-full flex-col gap-3">{children}</div> : null}
    </div>
  );
};
