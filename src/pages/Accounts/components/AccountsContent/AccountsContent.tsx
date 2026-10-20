import { ChevronRight, Plus } from 'lucide-react';
import { DebtsIcon } from '~/components/icons';
import { Button } from '~/components/ui/Button';
import { PageLink } from '~/components/ui/PageLink';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { Tile } from '~/components/ui/Tile';
import { MEDIA, ROUTES } from '~/constants';
import { Budget } from '~/hooks/useBudget';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { formatBalance, formatMoney } from '~/lib/format';
import { useAccountDialogStore } from '~/state/accountDialog';
import { ACCOUNTS_VIEWS, AccountsViewState, useAccounts } from '../../hooks';
import { AccountRow } from '../AccountRow';
import { BeforePaydayContent } from '../BeforePaydayContent';
import { CountedTile } from '../CountedTile';
import { MobileAccountRow } from '../MobileAccountRow';
import { NetWorthHero } from '../NetWorthHero';
import { UnchosenBanner } from '../UnchosenBanner';

const groupHeadClasses = 'flex min-h-11 items-center justify-between gap-3 px-1';
const groupTitleClasses = 'text-[17px] font-extrabold tracking-[-0.02em]';
const mobileHeadClasses =
  'flex items-center justify-between px-1 pt-1 text-xs font-extrabold tracking-[0.04em] text-muted uppercase';

/*
 * The page once the budget has loaded: everything you have, what counts in free to spend, then the
 * accounts to spend from, savings and what's owed. With more than one account to spend from,
 * Before payday shows what each has left by payday. Only one layout is rendered. The desktop
 * header holds the view switch; on a phone it sits at the top of the page.
 */
export const AccountsContent = ({
  budget,
  views
}: {
  budget: Budget;
  views: AccountsViewState;
}) => {
  const model = useAccounts(budget);
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const openAdd = useAccountDialogStore(s => s.openAdd);
  const { today, spending, savings, debts, totals, several, unchosen, paidInto } = model;
  const debtNames = debts.map(debt => debt.name).join(', ');

  // Shown above either view, once there's more than one account to spend from
  const top = (
    <>
      {views.several && !isDesktop ? (
        <SegmentedControl
          aria-label="Accounts view"
          value={views.view}
          onValueChange={views.setView}
          options={ACCOUNTS_VIEWS}
          fullWidth
        />
      ) : null}
      {unchosen.length && paidInto ? (
        <UnchosenBanner
          names={unchosen.map(payment => payment.name)}
          paidIntoName={paidInto.name}
          compact={!isDesktop}
        />
      ) : null}
    </>
  );

  const noSavings = (
    <div className="flex flex-col items-start gap-3 px-2 py-3">
      <p className="text-sm font-medium text-muted">
        No savings yet. Add an account to see everything you have in one place.
      </p>
      <Button onClick={openAdd} className="px-4">
        <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
        Add savings account
      </Button>
    </div>
  );

  const owed = debts.length ? (
    <PageLink
      page="debts"
      to={ROUTES.debts}
      className="flex min-h-16 items-center gap-3.5 rounded-2xl px-2 text-text no-underline transition-colors hover:bg-hover">
      <span
        aria-hidden="true"
        className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2">
        <DebtsIcon size={17} />
      </span>
      <span className="flex min-w-0 grow flex-col gap-0.5">
        <span className="text-[15px] font-bold">
          {debts.length} {debts.length === 1 ? 'debt' : 'debts'}
        </span>
        <span className="text-xs font-semibold [overflow-wrap:anywhere] text-muted">
          {debtNames}
        </span>
      </span>
      <span className="shrink-0 num text-[15px] font-extrabold text-expense md:text-[17px]">
        −{formatMoney(totals.owed)}
      </span>
      <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
    </PageLink>
  ) : null;

  if (views.view === 'before') {
    return (
      <section
        aria-label="Accounts"
        className={isDesktop ? 'flex flex-col gap-4' : 'flex flex-col gap-3.5'}>
        {top}
        <BeforePaydayContent accounts={model} isDesktop={isDesktop} />
      </section>
    );
  }

  if (isDesktop) {
    return (
      <section aria-label="Accounts" className="flex flex-col gap-4">
        {top}
        <div className="grid items-stretch gap-4 min-[68.75rem]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
          <NetWorthHero accounts={model} />
          <CountedTile accounts={model} />
        </div>

        <Tile flat aria-labelledby="accounts-spending" className="gap-1 md:gap-1">
          <div className={groupHeadClasses}>
            <h2 id="accounts-spending" className={groupTitleClasses}>
              Spending
            </h2>
            <span className="num text-[15px] font-extrabold text-muted">
              {formatBalance(totals.spending)}
            </span>
          </div>
          {spending.map(account => (
            <AccountRow
              key={account.id}
              account={account}
              today={today}
              several={several}
              onCounts={counts => model.setCounts(account, counts)}
            />
          ))}
        </Tile>

        <Tile flat aria-labelledby="accounts-savings" className="gap-1 md:gap-1">
          <div className={groupHeadClasses}>
            <h2 id="accounts-savings" className={groupTitleClasses}>
              Savings
            </h2>
            {savings.length ? (
              <span className="num text-[15px] font-extrabold text-muted">
                {formatBalance(totals.savings)}
              </span>
            ) : null}
          </div>
          {savings.length
            ? savings.map(account => (
                <AccountRow
                  key={account.id}
                  account={account}
                  today={today}
                  several={several}
                  onCounts={counts => model.setCounts(account, counts)}
                />
              ))
            : noSavings}
        </Tile>

        {owed ? (
          <Tile flat aria-labelledby="accounts-owed" className="gap-1 md:gap-1">
            <div className={groupHeadClasses}>
              <h2 id="accounts-owed" className={groupTitleClasses}>
                Owed
              </h2>
              <PageLink
                page="debts"
                to={ROUTES.debts}
                className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-[13px] font-bold text-accent-text no-underline hover:bg-hover">
                Open Debts
                <ChevronRight size={15} aria-hidden="true" />
              </PageLink>
            </div>
            {owed}
          </Tile>
        ) : null}
      </section>
    );
  }

  return (
    <section aria-label="Accounts" className="flex flex-col gap-3.5">
      {top}
      <NetWorthHero accounts={model} compact />
      <CountedTile accounts={model} compact />

      <h2 className={mobileHeadClasses}>
        <span>Spending</span>
        <span className="num tracking-normal">{formatBalance(totals.spending)}</span>
      </h2>
      <div className="rounded-3xl border border-border bg-surface p-1.5">
        {spending.map(account => (
          <MobileAccountRow key={account.id} account={account} today={today} several={several} />
        ))}
      </div>

      <h2 className={mobileHeadClasses}>
        <span>Savings</span>
        {savings.length ? (
          <span className="num tracking-normal">{formatBalance(totals.savings)}</span>
        ) : null}
      </h2>
      <div className="rounded-3xl border border-border bg-surface p-1.5">
        {savings.length
          ? savings.map(account => (
              <MobileAccountRow
                key={account.id}
                account={account}
                today={today}
                several={several}
              />
            ))
          : noSavings}
      </div>

      {owed ? (
        <>
          <h2 className={mobileHeadClasses}>
            <span>Owed</span>
            <span className="num tracking-normal">−{formatMoney(totals.owed)}</span>
          </h2>
          <div className="rounded-3xl border border-border bg-surface p-1.5">{owed}</div>
        </>
      ) : null}
    </section>
  );
};
