import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { AccountIcon } from '~/components/accounts';
import { AccountBeforePayday, goesBelowZero } from '~/lib/accounts';
import { cn } from '~/lib/cn';
import { formatShortDate } from '~/lib/dates';
import { formatBalance } from '~/lib/format';
import { AccountBeforeSum } from '../AccountBeforeSum';
import { BeforePaydayPayment } from '../BeforePaydayPayment';
import { BeforePaydayWarning } from '../BeforePaydayWarning';
import { PaidIntoTag } from '../PaidIntoTag';

interface AccountBeforeRowProps {
  row: AccountBeforePayday;
  today: Date;
  several: boolean;
  // In the desktop card, where a heading sits above the first account
  isDesktop: boolean;
  // The sum runs across the row, which needs a wide screen; otherwise the amounts sit in three
  // boxes under the name, as on a phone
  across: boolean;
}

/*
 * One account to spend from, before payday: its balance, what goes out and what's left, then its
 * payments when opened. One that would go below £0 opens with a warning, so it's never missed.
 */
export const AccountBeforeRow = ({
  row,
  today,
  several,
  isDesktop,
  across
}: AccountBeforeRowProps) => {
  const { account, lowest } = row;
  const below = goesBelowZero(row);
  // Already below £0 today, before anything goes out
  const overdrawn = account.balance < 0;
  // And going further down before payday
  const lower = overdrawn && !!lowest && lowest.amount < account.balance;
  const warn = below || overdrawn;
  const [open, setOpen] = useState(warn);
  const listId = `before-${account.id}`;
  // With nothing going out, even on payday, there's nothing to open: the line under the name says it
  const empty = !row.movements.length && !row.onPayday.length;
  const lowestText = overdrawn
    ? lower && lowest
      ? `Already below £0, down to ${formatBalance(lowest.amount)} on ${formatShortDate(lowest.date, today)}`
      : `Already below £0 (${formatBalance(account.balance)})`
    : !lowest
      ? 'Nothing goes out before payday'
      : below
        ? `Goes below £0 on ${formatShortDate(lowest.date, today)} (${formatBalance(lowest.amount)})`
        : `Lowest point ${formatBalance(lowest.amount)} on ${formatShortDate(lowest.date, today)}`;
  const icon = <AccountIcon account={account} />;
  const name = (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <span className="text-base font-extrabold [overflow-wrap:anywhere]">{account.name}</span>
      {several && account.paidInto ? <PaidIntoTag /> : null}
    </span>
  );
  const lowLine = (
    <span className={cn('text-xs leading-[1.35] font-semibold', warn ? 'text-warn' : 'text-muted')}>
      {lowestText}
    </span>
  );
  const HeaderTag = empty ? 'div' : 'button';
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
    // A rule above each account. On desktop the first one sets the accounts off from the heading
    // inside the card; on mobile the heading sits above the card, so the first would only double
    // the card's own border.
    <div className={cn('border-t border-border', !isDesktop && 'first:border-t-0')}>
      <h3>
        <HeaderTag
          {...(empty
            ? {}
            : {
                type: 'button' as const,
                'aria-expanded': open,
                'aria-controls': listId,
                onClick: () => setOpen(current => !current)
              })}
          className={cn(
            'flex w-full text-left',
            !empty && 'cursor-pointer transition-colors hover:bg-hover',
            across
              ? 'min-h-[84px] items-center gap-3.5 rounded-2xl px-2 py-3'
              : 'flex-col gap-2.5 rounded-[18px] px-2.5 py-3.5'
          )}>
          {across ? (
            <>
              {icon}
              <span className="flex min-w-0 flex-1 flex-col gap-[3px]">
                {name}
                {lowLine}
              </span>
              <AccountBeforeSum row={row} across />
              {empty ? <span aria-hidden="true" className="w-8 shrink-0" /> : chevron}
            </>
          ) : (
            <>
              <span className="flex items-center gap-3">
                {icon}
                <span className="flex min-w-0 flex-1">{name}</span>
                {empty ? null : chevron}
              </span>
              <AccountBeforeSum row={row} across={false} />
              {lowLine}
            </>
          )}
        </HeaderTag>
      </h3>

      {empty ? null : (
        <div
          id={listId}
          role="region"
          aria-label={`${account.name} before payday`}
          hidden={!open}
          className={across ? 'pr-4 pb-4 pl-[60px]' : 'px-2.5 pb-3'}>
          <div className="flex flex-col gap-1.5">
            <BeforePaydayWarning row={row} today={today} />
            <ul className="flex flex-col">
              {row.movements.map(item => (
                <BeforePaydayPayment key={item.key} item={item} across={across} />
              ))}
              {row.onPayday.map(item => (
                <BeforePaydayPayment key={item.key} item={item} onPayday across={across} />
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
