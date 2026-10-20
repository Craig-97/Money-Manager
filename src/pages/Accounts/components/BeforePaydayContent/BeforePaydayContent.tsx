import { Tile } from '~/components/ui/Tile';
import { accountLetter } from '~/lib/accounts';
import { formatBalance, formatMoney } from '~/lib/format';
import { Accounts } from '../../hooks';
import { AccountBeforeRow } from '../AccountBeforeRow';
import { BeforePaydayHero } from '../BeforePaydayHero';
import { OnPaydayTile } from '../OnPaydayTile';

const titleClasses = 'px-1 text-[17px] font-extrabold tracking-[-0.02em]';

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

  return (
    <>
      <div className="grid items-stretch gap-4 min-[68.75rem]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <BeforePaydayHero accounts={model} compact={!isDesktop} />
        <OnPaydayTile accounts={model} />
      </div>

      <Tile flat aria-labelledby="before-spending" className="gap-1 md:gap-1">
        <h2 id="before-spending" className={titleClasses}>
          Spending accounts
        </h2>
        <div>
          {beforePayday.spending.map(row => (
            <AccountBeforeRow key={row.account.id} row={row} today={today} several={several} />
          ))}
        </div>
      </Tile>

      {savings.length ? (
        <Tile flat aria-labelledby="before-savings" className="gap-1 md:gap-1">
          <h2 id="before-savings" className={titleClasses}>
            Savings
          </h2>
          <div>
            {savings.map(row => (
              <div
                key={row.account.id}
                className="flex flex-wrap items-center gap-x-3.5 gap-y-1 border-t border-border px-2 py-3 first:border-t-0">
                <span
                  aria-hidden="true"
                  className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-sm font-extrabold">
                  {accountLetter(row.account)}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-bold [overflow-wrap:anywhere]">
                    {row.account.name}
                  </span>
                  <span className="text-xs font-semibold text-muted">
                    {row.comesIn
                      ? `+${formatMoney(row.comesIn)} paid in before payday`
                      : 'Nothing paid in before payday'}
                  </span>
                </span>
                <span className="flex flex-col items-end gap-0.5">
                  <span className="text-[11px] font-semibold text-muted">At payday</span>
                  <span className="num text-[15px] font-extrabold whitespace-nowrap">
                    {formatBalance(row.left)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </Tile>
      ) : null}
    </>
  );
};
