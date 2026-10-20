import { ChevronDown } from 'lucide-react';
import { AmountInput } from '~/components/form/AmountInput';
import { accountLetter } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { PaydayPrompt } from '../../../hooks/usePaydayPrompt';
import { StepNumber } from '../StepNumber';

/*
 * The optional last step: the other accounts' balances to check while the banking app is open,
 * spending ones first. Folded away with a summary until opened; each one starts as what it holds,
 * with anything paid in added and anything gone out taken off.
 */
export const SavingsCheck = ({ prompt, number }: { prompt: PaydayPrompt; number: number }) => {
  const { savings } = prompt;
  const spending = savings.rows.filter(row => row.account.kind === 'SPENDING');
  const groups = prompt.otherSpending
    ? [
        { label: 'Spending', rows: spending },
        { label: 'Savings', rows: savings.rows.filter(row => row.account.kind !== 'SPENDING') }
      ].filter(group => group.rows.length)
    : [{ label: null, rows: savings.rows }];
  return (
    <div className="md:grid md:grid-cols-[32px_minmax(0,1fr)] md:gap-x-4">
      <StepNumber className="hidden md:inline-flex">{number}</StepNumber>
      <div className="min-w-0">
        <button
          type="button"
          onClick={savings.toggle}
          aria-expanded={savings.open}
          aria-controls="payday-savings"
          className="flex min-h-11 w-full cursor-pointer items-center gap-3 text-left md:pt-[5px]">
          <StepNumber className="md:hidden">{number}</StepNumber>
          <span className="flex min-w-0 grow flex-col gap-0.5">
            <span className="text-[15px] font-extrabold tracking-[-0.01em] md:text-base">
              {prompt.otherSpending ? 'Update your other accounts' : 'Update your savings too'}
            </span>
            <span className="text-xs font-semibold text-muted md:text-[13px]">
              Optional · {savings.count}
              {savings.staleText ? (
                <>
                  {' · '}
                  <span className="text-warn">{savings.staleText}</span>
                </>
              ) : null}
            </span>
          </span>
          <ChevronDown
            size={18}
            className={cn('shrink-0 text-muted transition-transform', savings.open && 'rotate-180')}
            aria-hidden="true"
          />
        </button>
        {savings.open ? (
          <div id="payday-savings">
            {groups.map(group => (
              <div key={group.label ?? 'all'}>
                {group.label ? (
                  <p className="mt-3 px-1 text-[11px] font-extrabold tracking-[0.04em] text-muted uppercase">
                    {group.label}
                  </p>
                ) : null}
                <div className="mt-2.5 overflow-hidden rounded-[20px] border border-border bg-surface-2">
                  {group.rows.map(row => (
                    <div
                      key={row.account.id}
                      className="flex min-h-[68px] items-center gap-3 border-t border-border py-2.5 pr-3 pl-3.5 first:border-t-0">
                      <span
                        aria-hidden="true"
                        className="hidden size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-sm font-extrabold md:inline-flex">
                        {accountLetter(row.account)}
                      </span>
                      <span className="flex min-w-0 grow flex-col gap-0.5">
                        <label
                          htmlFor={`payday-savings-${row.account.id}`}
                          className="text-[15px] font-bold">
                          {row.account.name}
                        </label>
                        <span
                          className={cn(
                            'text-xs leading-snug font-semibold',
                            row.stale ? 'text-warn' : 'text-muted'
                          )}>
                          {row.sub}
                        </span>
                      </span>
                      <AmountInput
                        id={`payday-savings-${row.account.id}`}
                        value={row.value}
                        onChange={event => row.setValue(event.target.value)}
                        boxClassName="w-[148px] shrink-0 md:w-[168px]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <p className="mt-2 text-xs leading-normal font-medium text-muted md:mt-2.5 md:text-[13px]">
              Only the ones you change are saved.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
