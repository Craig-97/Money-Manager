import { AccountIcon } from '~/components/accounts';
import { AmountInput } from '~/components/form';
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
    {desktop ? <AccountIcon account={row.account} size="sm" onGrey /> : null}
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
