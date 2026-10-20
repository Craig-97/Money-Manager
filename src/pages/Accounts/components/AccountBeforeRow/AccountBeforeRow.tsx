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
 * payments when opened. One that would go below £0 opens with a warning, so it's never missed.
 */
export const AccountBeforeRow = ({ row, today, several }: AccountBeforeRowProps) => {
  const { account, lowest } = row;
  const below = goesBelowZero(row);
  const [open, setOpen] = useState(below);
  const listId = `before-${account.id}`;
  const lowestText = lowest
    ? `Lowest point ${formatBalance(lowest.amount)} on ${formatShortDate(lowest.date, today)}`
    : 'Nothing going out before payday';
  // "Left at payday" is "At payday" in the narrow boxes on a phone
  const sums = [
    { label: 'Balance', short: 'Balance', value: formatBalance(account.balance) },
    {
      label: 'Goes out',
      short: 'Goes out',
      value: row.goesOut ? `−${formatMoney(row.goesOut)}` : formatMoney(0)
    },
    { label: 'Left at payday', short: 'At payday', value: formatBalance(row.left) }
  ];

  return (
    <div className="border-t border-border first:border-t-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen(current => !current)}
        className="flex w-full cursor-pointer flex-wrap items-center gap-x-3.5 gap-y-2.5 rounded-2xl px-2 py-3 text-left transition-colors hover:bg-hover">
        <span
          aria-hidden="true"
          className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-extrabold">
          {accountLetter(account)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-bold [overflow-wrap:anywhere]">{account.name}</span>
            {several && account.paidInto ? <PaidIntoTag /> : null}
          </span>
          <span className={cn('text-xs font-semibold', below ? 'text-warn' : 'text-muted')}>
            {lowestText}
          </span>
        </span>
        <span className="order-last grid w-full grid-cols-3 gap-2 md:order-none md:flex md:w-auto md:items-center md:gap-5">
          {sums.map((sum, index) => (
            <span
              key={sum.label}
              className="flex flex-col gap-0.5 rounded-xl bg-surface-2 px-2.5 py-2 md:bg-transparent md:p-0 md:text-right">
              <span className="text-[11px] font-semibold text-muted">
                <span className="md:hidden">{sum.short}</span>
                <span className="max-md:hidden">{sum.label}</span>
              </span>
              <span
                className={cn(
                  'num text-[13px] font-extrabold whitespace-nowrap md:text-[15px]',
                  index === 2 && row.left < 0 && 'text-expense'
                )}>
                {sum.value}
              </span>
            </span>
          ))}
        </span>
        <ChevronDown
          size={18}
          aria-hidden="true"
          className={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')}
        />
      </button>

      <div id={listId} role="region" aria-label={`${account.name} before payday`} hidden={!open}>
        <div className="flex flex-col pb-3 md:pl-[52px]">
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
