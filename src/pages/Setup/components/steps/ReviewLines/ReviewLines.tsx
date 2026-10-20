import { cn } from '~/lib/cn';
import { useSetupDesktop } from '../../../hooks';

export interface ReviewLine {
  key: string;
  name: string;
  details: string;
  amount: string;
  tone?: 'income' | 'expense';
  // Under the amount on desktop, e.g. "Next Tue 2 Nov"
  next?: string;
  // In place of the details on mobile, e.g. "Where you get paid"
  tag?: string;
}

interface ReviewLinesProps {
  lines: ReviewLine[];
  // What to say when there are none
  empty: string;
  kind: 'accounts' | 'payments';
}

/*
 * The accounts or payments in a review card. Payments have a coloured letter for money in or out;
 * accounts a plain one on desktop and none on mobile, where the account pay lands in has a tag.
 */
export const ReviewLines = ({ lines, empty, kind }: ReviewLinesProps) => {
  const isDesktop = useSetupDesktop();
  const isAccounts = kind === 'accounts';

  if (!lines.length) {
    return (
      <p className={cn('py-3.5 text-sm text-muted', !isDesktop && 'border-t border-border px-4')}>
        {empty}
      </p>
    );
  }

  const showLetter = isDesktop || !isAccounts;
  return (
    <ul className={cn(isDesktop && 'mt-2')}>
      {lines.map(line => (
        <li
          key={line.key}
          className={cn(
            'flex items-center gap-3 border-t border-border',
            isDesktop ? 'min-h-[60px] py-2' : 'px-4 py-3.5'
          )}>
          {showLetter ? (
            <span
              aria-hidden="true"
              className={cn(
                'inline-flex shrink-0 items-center justify-center font-extrabold',
                isDesktop ? 'rounded-xl text-sm' : 'size-10 rounded-[13px] text-[15px]',
                isDesktop &&
                  (isAccounts ? 'size-[38px] border border-border bg-surface-2' : 'size-9'),
                line.tone === 'income' && 'bg-income-bg text-income',
                line.tone === 'expense' && 'bg-expense-bg text-expense'
              )}>
              {(line.name.trim() || '?').charAt(0).toUpperCase()}
            </span>
          ) : null}
          <span className={cn('flex min-w-0 grow flex-col', isDesktop ? 'gap-0.5' : 'gap-1')}>
            <span
              className={cn(
                'leading-[1.3] font-bold [overflow-wrap:anywhere]',
                !isDesktop && isAccounts ? 'text-[15px]' : 'text-sm'
              )}>
              {line.name}
            </span>
            {!isDesktop && line.tag ? (
              <span className="inline-flex h-6 items-center self-start rounded-full bg-accent-soft px-2.5 text-[11px] font-bold whitespace-nowrap text-accent-text">
                {line.tag}
              </span>
            ) : line.details ? (
              <span
                className={cn(
                  'text-xs leading-[1.4] [overflow-wrap:anywhere] text-muted',
                  isDesktop ? 'font-medium' : 'font-semibold'
                )}>
                {line.details}
              </span>
            ) : null}
          </span>
          <span className="flex shrink-0 flex-col items-end gap-0.5">
            <span
              className={cn(
                'num font-extrabold whitespace-nowrap',
                !isDesktop && isAccounts ? 'text-[15px]' : 'text-sm',
                line.tone === 'income' && 'text-income',
                line.tone === 'expense' && 'text-expense'
              )}>
              {line.amount}
            </span>
            {isDesktop && line.next ? (
              <span className="text-xs font-medium whitespace-nowrap text-muted">{line.next}</span>
            ) : null}
          </span>
        </li>
      ))}
    </ul>
  );
};
