import { ChevronDown } from 'lucide-react';
import { MEDIA } from '~/constants';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { isSpending } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { PaydayPrompt } from '../../../hooks/usePaydayPrompt';
import { AccountBalanceRow } from '../AccountBalanceRow';
import { StepNumber } from '../StepNumber';

const groupHeadClasses =
  'flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 text-xs font-extrabold tracking-[0.04em] text-muted uppercase';
const groupNoteClasses = 'text-xs font-semibold tracking-normal normal-case';

type Rows = PaydayPrompt['savings']['rows'];

// What a group's accounts do to free to spend, when they all do the same
const countsNote = (rows: Rows) =>
  rows.every(row => row.account.counts)
    ? 'Counts in free to spend'
    : rows.every(row => !row.account.counts)
      ? 'Kept out of free to spend'
      : null;

/*
 * The optional last step: the other accounts' balances to check while the banking app is open,
 * spending ones first. Each starts as what it should hold, with anything paid in added and
 * anything gone out taken off. On desktop it's a numbered step; on mobile one card that opens,
 * with the group heads and rows inside it.
 */
export const SavingsCheck = ({ prompt, number }: { prompt: PaydayPrompt; number: number }) => {
  const desktop = useMediaQuery(MEDIA.desktop);
  const { savings } = prompt;
  const groups: { label: string | null; note: string | null; rows: Rows }[] = prompt.otherSpending
    ? [
        savings.rows.filter(row => isSpending(row.account)),
        savings.rows.filter(row => !isSpending(row.account))
      ]
        .filter(rows => rows.length)
        .map(rows => ({
          label: isSpending(rows[0].account) ? 'Spending' : 'Savings',
          note: countsNote(rows),
          rows
        }))
    : [{ label: null, note: null, rows: savings.rows }];

  const toggle = (
    <button
      type="button"
      onClick={savings.toggle}
      aria-expanded={savings.open}
      aria-controls="payday-savings"
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 text-left',
        desktop ? 'min-h-11' : 'min-h-16 py-2.5 pr-3.5 pl-4'
      )}>
      <span className={cn('flex min-w-0 grow flex-col gap-0.5', desktop && 'pt-[5px]')}>
        <span
          className={cn(
            'font-extrabold',
            desktop ? 'text-base tracking-[-0.01em]' : 'text-[15px]'
          )}>
          {prompt.otherSpending ? 'Update your other accounts' : 'Update your savings too'}
        </span>
        <span
          className={cn(
            'font-semibold text-muted',
            desktop ? 'text-[13px]' : 'text-xs leading-[1.4]'
          )}>
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
  );

  if (!desktop) {
    return (
      <div className="overflow-hidden rounded-[20px] border border-border bg-surface-2">
        {toggle}
        {savings.open ? (
          <div id="payday-savings">
            {groups.map(group => (
              <div key={group.label ?? 'all'}>
                {group.label ? (
                  <p className={cn(groupHeadClasses, 'border-t border-border px-4 pt-3 pb-0.5')}>
                    {group.label}
                    {group.note ? <span className={groupNoteClasses}>{group.note}</span> : null}
                  </p>
                ) : null}
                {group.rows.map((row, index) => (
                  <AccountBalanceRow
                    key={row.account.id}
                    row={row}
                    desktop={false}
                    className={cn(
                      'pl-4',
                      // Right under a head, the head's line divides it
                      (!group.label || index > 0) && 'border-t border-border'
                    )}
                  />
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-[32px_minmax(0,1fr)] gap-x-4">
      <StepNumber>{number}</StepNumber>
      <div className="min-w-0">
        {toggle}
        {savings.open ? (
          <div id="payday-savings">
            {groups.map(group => (
              <div key={group.label ?? 'all'}>
                {group.label ? (
                  <p className={cn(groupHeadClasses, 'mx-0.5 mt-4 mb-2')}>
                    {group.label}
                    {group.note ? <span className={groupNoteClasses}>{group.note}</span> : null}
                  </p>
                ) : null}
                <div
                  className={cn(
                    'overflow-hidden rounded-[20px] border border-border bg-surface-2',
                    !group.label && 'mt-2.5'
                  )}>
                  {group.rows.map(row => (
                    <AccountBalanceRow
                      key={row.account.id}
                      row={row}
                      desktop
                      className="border-t border-border pl-3.5 first:border-t-0"
                    />
                  ))}
                </div>
              </div>
            ))}
            <p className="mt-2.5 text-[13px] leading-normal font-medium text-muted">
              Only the ones you change are saved.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};
