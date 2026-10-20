import { Info } from 'lucide-react';
import { Tile } from '~/components/ui/Tile';
import { accountLetter } from '~/lib/accounts';
import { formatBalance, formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { Accounts } from '../../hooks';
import { AccountBeforeRow } from '../AccountBeforeRow';
import { BeforePaydayHero } from '../BeforePaydayHero';
import { OnPaydayTile } from '../OnPaydayTile';

/*
 * The Before payday view: what's left at payday across the accounts to spend from, what lands on
 * payday, then each account in a row that opens to its payments, and savings with what's paid in.
 * The same order on desktop and mobile.
 */
export const BeforePaydayContent = ({
  accounts: model,
  isDesktop
}: {
  accounts: Accounts;
  isDesktop: boolean;
}) => {
  const { beforePayday, today, several } = model;
  const savings = beforePayday.savings;
  const savingsAtPayday = savings.reduce((total, row) => total + row.left, 0);

  return (
    <>
      <div className="grid items-stretch gap-4 min-[68.75rem]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <BeforePaydayHero accounts={model} compact={!isDesktop} />
        <OnPaydayTile accounts={model} />
      </div>

      {isDesktop ? (
        <Tile flat aria-labelledby="before-spending" className="gap-1 md:gap-1">
          <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-3 px-2 pb-1">
            <h2 id="before-spending" className="text-[17px] font-extrabold tracking-[-0.02em]">
              Spending accounts
            </h2>
            <span className="text-[13px] font-semibold text-muted">
              Open one to see what goes out of it
            </span>
          </div>
          <div>
            {beforePayday.spending.map(row => (
              <AccountBeforeRow
                key={row.account.id}
                row={row}
                today={today}
                several={several}
                isDesktop
              />
            ))}
          </div>
        </Tile>
      ) : (
        <>
          <h2
            id="before-spending"
            className="flex items-center justify-between px-1 pt-1 text-xs font-extrabold tracking-[0.04em] text-muted uppercase">
            <span>Spending accounts</span>
            <span className="num tracking-normal">{formatBalance(beforePayday.left)} left</span>
          </h2>
          <section
            aria-labelledby="before-spending"
            className="rounded-3xl border border-border bg-surface p-1.5">
            {beforePayday.spending.map(row => (
              <AccountBeforeRow
                key={row.account.id}
                row={row}
                today={today}
                several={several}
                isDesktop={false}
              />
            ))}
          </section>
        </>
      )}

      {savings.length ? (
        <>
          {isDesktop ? null : (
            <h2
              id="before-savings"
              className="flex items-center justify-between px-1 pt-1 text-xs font-extrabold tracking-[0.04em] text-muted uppercase">
              <span>Savings</span>
              <span className="num tracking-normal">
                {formatBalance(savingsAtPayday)} at payday
              </span>
            </h2>
          )}
          <section
            aria-labelledby="before-savings"
            className={
              isDesktop
                ? 'flex flex-col gap-1 rounded-[28px] border border-border bg-surface px-6 py-5'
                : 'rounded-3xl border border-border bg-surface p-1.5'
            }>
            {isDesktop ? (
              <div className="flex min-h-11 items-center justify-between gap-3">
                <h2 id="before-savings" className="text-[17px] font-extrabold tracking-[-0.02em]">
                  Savings
                </h2>
                <span className="num text-[15px] font-extrabold text-muted">
                  {formatBalance(savingsAtPayday)} at payday
                </span>
              </div>
            ) : null}
            {savings.map(row => {
              const paidIn = row.movements.filter(item => item.amount > 0);
              const sub = paidIn.length
                ? paidIn
                    .map(
                      item =>
                        `${item.payment.name}${item.other ? ` from ${item.other.name}` : ''} on ${formatShortDate(item.date, today)}`
                    )
                    .join(', ')
                : 'Nothing moves before payday';
              const change = row.comesIn ? `+${formatMoney(row.comesIn)}` : '';
              return (
                <div
                  key={row.account.id}
                  className={
                    isDesktop
                      ? 'flex min-h-[72px] items-center gap-3.5 border-t border-border px-2 first:border-t-0 [&:nth-child(2)]:border-t-0'
                      : 'flex min-h-[72px] items-center gap-3 border-t border-border px-2.5 py-2 first:border-t-0'
                  }>
                  <span
                    aria-hidden="true"
                    className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-extrabold">
                    {accountLetter(row.account)}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-[15px] font-bold [overflow-wrap:anywhere]">
                      {row.account.name}
                    </span>
                    <span className="text-xs leading-[1.35] font-semibold [overflow-wrap:anywhere] text-muted">
                      {sub}
                    </span>
                  </span>
                  {isDesktop ? (
                    <>
                      <span className="w-[130px] shrink-0 text-right num text-[15px] font-extrabold text-income">
                        {change}
                      </span>
                      <span className="flex w-[170px] shrink-0 flex-col items-end gap-0.5">
                        <span className="num text-[17px] font-extrabold whitespace-nowrap">
                          {formatBalance(row.left)}
                        </span>
                        <span className="text-xs font-semibold text-muted">at payday</span>
                      </span>
                    </>
                  ) : (
                    <span className="flex shrink-0 flex-col items-end gap-0.5">
                      <span className="num text-[15px] font-extrabold whitespace-nowrap">
                        {formatBalance(row.left)}
                      </span>
                      {change ? (
                        <span className="num text-xs font-bold text-income">{change}</span>
                      ) : null}
                    </span>
                  )}
                </div>
              );
            })}
          </section>
        </>
      ) : null}

      <p className="flex items-start gap-2.5 rounded-2xl border border-border bg-surface-2 px-3.5 py-3 text-[13px] leading-[1.45] font-semibold text-muted">
        <Info size={16} className="mt-px shrink-0" aria-hidden="true" />
        <span>
          <b className="text-text">Moving money between your accounts.</b> When both accounts count
          in free to spend, a transfer doesn’t change free to spend and is left out of your monthly
          totals.
          {isDesktop ? ' Money paid into savings that don’t count comes off like any payment.' : ''}
        </span>
      </p>
    </>
  );
};
