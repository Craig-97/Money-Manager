import { useState } from 'react';
import { AlertTriangle, ChevronDown } from 'lucide-react';
import { AccountBeforePayday, accountLetter, goesBelowZero } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatBalance, formatMoney, formatPayment } from '~/lib/format';
import { categoryLabel, formatShortDate } from '~/lib/payments';
import { PaidIntoTag } from '../PaidIntoTag';

interface AccountBeforeRowProps {
  row: AccountBeforePayday;
  today: Date;
  several: boolean;
  isDesktop: boolean;
}

// The line under a payment: what it's for, and the account at the other end of money moving
const detailsOf = (item: AccountBeforePayday['movements'][number]) =>
  [
    item.payment.kind === 'oneOff' ? 'One-off' : categoryLabel(item.payment.category),
    item.other ? (item.amount < 0 ? `Into ${item.other.name}` : `From ${item.other.name}`) : null
  ]
    .filter(Boolean)
    .join(' · ');

/*
 * One account to spend from, before payday: its balance, what goes out and what's left, then its
 * payments when opened. One that would go below £0 opens with a warning, so it's never missed. On
 * desktop the sum runs across the row; on a phone it sits in three boxes under the name.
 */
export const AccountBeforeRow = ({ row, today, several, isDesktop }: AccountBeforeRowProps) => {
  const { account, lowest } = row;
  const below = goesBelowZero(row);
  const [open, setOpen] = useState(below);
  const listId = `before-${account.id}`;
  const lowestText = !lowest
    ? 'Nothing goes out before payday'
    : below
      ? `Goes below £0 on ${formatShortDate(lowest.date, today)} (${formatBalance(lowest.amount)})`
      : `Lowest point ${formatBalance(lowest.amount)} on ${formatShortDate(lowest.date, today)}`;
  const leftClasses = cn('num font-extrabold whitespace-nowrap', row.left < 0 && 'text-expense');
  const letter = (
    <span
      aria-hidden="true"
      className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-extrabold">
      {accountLetter(account)}
    </span>
  );
  const name = (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-base font-extrabold [overflow-wrap:anywhere]">{account.name}</span>
      {several && account.paidInto ? <PaidIntoTag /> : null}
    </span>
  );
  const lowLine = (
    <span
      className={cn('text-xs leading-[1.35] font-semibold', below ? 'text-warn' : 'text-muted')}>
      {lowestText}
    </span>
  );
  const chevron = (
    <span
      aria-hidden="true"
      className="inline-flex size-8 shrink-0 items-center justify-center text-muted">
      <ChevronDown
        size={18}
        strokeWidth={2.25}
        className={cn('transition-transform', open && 'rotate-180')}
      />
    </span>
  );

  return (
    <div className="border-t border-border first:border-t-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={listId}
          onClick={() => setOpen(current => !current)}
          className={cn(
            'flex w-full cursor-pointer text-left transition-colors hover:bg-hover',
            isDesktop
              ? 'min-h-[84px] items-center gap-3.5 rounded-2xl px-2 py-3'
              : 'flex-col gap-2.5 rounded-[18px] px-2.5 py-3.5'
          )}>
          {isDesktop ? (
            <>
              {letter}
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                {name}
                {lowLine}
              </span>
              <span className="flex w-[130px] shrink-0 flex-col items-end gap-0.5">
                <span className="text-xs text-muted">Balance</span>
                <span className="num text-base font-extrabold whitespace-nowrap">
                  {formatBalance(account.balance)}
                </span>
              </span>
              <span aria-hidden="true" className="w-3.5 shrink-0 text-center font-bold text-muted">
                −
              </span>
              <span className="flex w-[130px] shrink-0 flex-col items-end gap-0.5">
                <span className="text-xs text-muted">Goes out</span>
                <span className="num text-base font-extrabold whitespace-nowrap">
                  {formatMoney(row.goesOut)}
                </span>
              </span>
              <span aria-hidden="true" className="w-3.5 shrink-0 text-center font-bold text-muted">
                =
              </span>
              <span className="flex w-[130px] shrink-0 flex-col items-end gap-0.5">
                <span className="text-xs text-accent-text">Left at payday</span>
                <span className={cn(leftClasses, 'text-base')}>{formatBalance(row.left)}</span>
              </span>
              {chevron}
            </>
          ) : (
            <>
              <span className="flex items-center gap-3">
                {letter}
                <span className="flex min-w-0 flex-1">{name}</span>
                {chevron}
              </span>
              <span className="grid grid-cols-3 gap-1.5">
                <span className="flex min-w-0 flex-col gap-1 rounded-2xl border border-border bg-surface-2 px-2.5 py-2">
                  <span className="text-[11px] font-bold text-muted">Balance</span>
                  <span className="num text-[13px] font-extrabold whitespace-nowrap">
                    {formatBalance(account.balance)}
                  </span>
                </span>
                <span className="flex min-w-0 flex-col gap-1 rounded-2xl border border-border bg-surface-2 px-2.5 py-2">
                  <span className="text-[11px] font-bold text-muted">− Goes out</span>
                  <span className="num text-[13px] font-extrabold whitespace-nowrap">
                    {formatMoney(row.goesOut)}
                  </span>
                </span>
                <span className="flex min-w-0 flex-col gap-1 rounded-2xl bg-accent-soft px-2.5 py-2">
                  <span className="text-[11px] font-bold text-accent-text">= Left</span>
                  <span className={cn(leftClasses, 'text-[13px]')}>{formatBalance(row.left)}</span>
                </span>
              </span>
              {lowLine}
            </>
          )}
        </button>
      </h3>

      <div id={listId} role="region" aria-label={`${account.name} before payday`} hidden={!open}>
        <div className={cn('flex flex-col pb-3', isDesktop && 'pl-[52px]')}>
          {below && lowest ? (
            <p className="mx-2 mb-2 flex items-start gap-2.5 rounded-[18px] bg-warn-bg px-3.5 py-3 text-[13px] font-semibold text-warn">
              <AlertTriangle size={16} className="mt-px shrink-0" aria-hidden="true" />
              <span>
                Goes below £0 on {formatShortDate(lowest.date, today)}{' '}
                <span className="whitespace-nowrap">({formatBalance(lowest.amount)}).</span> Move
                money in before then.
              </span>
            </p>
          ) : null}
          {row.movements.length || row.onPayday.length ? (
            <>
              {row.movements.map(item => (
                <div key={item.key} className="flex items-center gap-3 rounded-xl px-2 py-2">
                  <span className="w-[74px] shrink-0 text-xs font-semibold text-muted">
                    {formatShortDate(item.date, today)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-bold [overflow-wrap:anywhere]">
                      {item.payment.name}
                    </span>
                    <span className="text-xs font-semibold text-muted">{detailsOf(item)}</span>
                  </span>
                  <span
                    className={cn(
                      'num text-sm font-extrabold whitespace-nowrap',
                      item.amount < 0 ? 'text-expense' : 'text-income'
                    )}>
                    {formatPayment(item.amount)}
                  </span>
                </div>
              ))}
              {row.onPayday.map(item => (
                <div
                  key={item.key}
                  className="flex items-center gap-3 rounded-xl px-2 py-2 text-muted">
                  <span className="w-[74px] shrink-0 text-xs font-semibold">Next cycle</span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-sm font-bold [overflow-wrap:anywhere]">
                      {item.payment.name}
                    </span>
                    <span className="text-xs font-semibold">On payday · {detailsOf(item)}</span>
                  </span>
                  <span className="num text-sm font-extrabold whitespace-nowrap">
                    {formatPayment(item.amount)}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <p className="px-2 py-2 text-sm font-medium text-muted">
              Nothing goes out before payday.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
