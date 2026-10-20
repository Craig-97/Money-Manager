import { AmountInput } from '~/components/form/AmountInput';
import { accountLetter } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { PaydayPrompt } from '../../../hooks/usePaydayPrompt';

interface AccountBalanceRowProps {
  row: PaydayPrompt['savings']['rows'][number];
  // Desktop has the account's letter badge and a wider box; the mobile card has neither
  desktop: boolean;
  className?: string;
}

/* One of the other accounts in the payday prompt's last step, with its balance to check */
export const AccountBalanceRow = ({ row, desktop, className }: AccountBalanceRowProps) => (
  <div className={cn('flex min-h-[68px] items-center gap-3 py-2.5 pr-3.5', className)}>
    {desktop ? (
      <span
        aria-hidden="true"
        className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-sm font-extrabold">
        {accountLetter(row.account)}
      </span>
    ) : null}
    <span className="flex min-w-0 grow flex-col gap-[3px]">
      <label htmlFor={`payday-savings-${row.account.id}`} className="text-[15px] font-bold">
        {row.account.name}
      </label>
      <span
        className={cn(
          'text-xs leading-[1.35] font-semibold',
          row.stale ? 'text-warn' : 'text-muted'
        )}>
        {row.sub}
      </span>
    </span>
    <AmountInput
      id={`payday-savings-${row.account.id}`}
      value={row.value}
      onChange={event => row.setValue(event.target.value)}
      boxClassName={cn(
        'h-12 shrink-0 rounded-[14px] bg-surface px-3',
        desktop ? 'w-[150px]' : 'w-[132px]'
      )}
      className="text-right text-base"
    />
  </div>
);
