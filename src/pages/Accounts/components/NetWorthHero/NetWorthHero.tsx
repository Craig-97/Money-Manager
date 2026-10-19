import { PageLink } from '~/components/ui/PageLink';
import { ROUTES } from '~/constants';
import { formatMoney, splitPence } from '~/lib/format';
import { Accounts } from '../../hooks';

const chipClasses = 'flex min-w-0 flex-col gap-1 rounded-[18px] bg-hero-chip px-3.5 py-3';
const opClasses = 'flex items-center justify-center text-xl font-bold text-hero-muted';

/*
 * Everything you have, after what you owe: every account less what's left on debts. On mobile it's
 * a smaller card with the same sums. Owed only shows when there are debts.
 */
export const NetWorthHero = ({
  accounts: model,
  compact = false
}: {
  accounts: Accounts;
  compact?: boolean;
}) => {
  const { totals, accounts, debts } = model;
  const [whole, pence] = splitPence(totals.netWorth);
  const owes = totals.owed > 0;
  const across = `${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`;
  const chips = [
    { label: 'Spending', value: totals.spending },
    { label: 'Savings', value: totals.savings }
  ];

  return (
    <article
      aria-label="Everything you have"
      className={
        compact
          ? 'relative flex flex-col gap-3.5 overflow-hidden rounded-3xl bg-hero-bg p-[22px] text-hero-text'
          : 'relative flex min-w-0 flex-col gap-6 overflow-hidden rounded-3xl bg-hero-bg p-7 text-hero-text transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_var(--shadow)]'
      }>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-[110px] -right-[90px] rounded-full bg-hero-chip ${compact ? 'size-[220px]' : 'size-[300px]'}`}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-bold text-hero-muted ${compact ? 'text-[13px]' : 'text-[15px]'}`}>
          Everything you have
        </h2>
        {owes ? (
          <span className="inline-flex items-center rounded-full bg-hero-chip px-3 py-1.5 text-xs font-bold md:px-3.5 md:py-2 md:text-[13px]">
            After what you owe
          </span>
        ) : null}
      </div>

      <div className="relative">
        <p
          className={`num leading-[0.95] font-extrabold tracking-[-0.05em] ${compact ? 'text-[52px]' : 'text-[84px]'}`}>
          {whole}
          <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">{pence}</span>
        </p>
        {compact ? null : (
          <p className="mt-3.5 text-[15px] font-semibold text-hero-muted">
            Across {across}
            {owes ? ` and ${debts.length} ${debts.length === 1 ? 'debt' : 'debts'}` : ''}. Balances
            you type in, never linked to your bank.
          </p>
        )}
      </div>

      <div
        role="group"
        aria-label="How it is worked out"
        className={`relative mt-auto grid items-stretch gap-1.5 md:gap-2 ${owes ? 'grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)_14px_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_20px_minmax(0,1fr)]' : 'grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)]'}`}>
        {chips.map((chip, index) => (
          <div key={chip.label} className="contents">
            {index ? (
              <span aria-hidden="true" className={opClasses}>
                +
              </span>
            ) : null}
            <div className={chipClasses}>
              <span className="text-xs font-semibold text-hero-muted">{chip.label}</span>
              <p className="num text-base font-extrabold [overflow-wrap:anywhere] md:text-lg">
                {formatMoney(chip.value, { whole: compact })}
              </p>
            </div>
          </div>
        ))}
        {owes ? (
          <>
            <span aria-hidden="true" className={opClasses}>
              −
            </span>
            <PageLink
              page="debts"
              to={ROUTES.debts}
              className={`${chipClasses} text-hero-text no-underline hover:bg-hero-chip/80`}>
              <span className="text-xs font-semibold text-hero-muted">Owed</span>
              <p className="num text-base font-extrabold [overflow-wrap:anywhere] md:text-lg">
                {formatMoney(totals.owed, { whole: compact })}
              </p>
              {compact ? null : (
                <span className="text-xs font-medium text-hero-muted">On Debts</span>
              )}
            </PageLink>
          </>
        ) : null}
      </div>
    </article>
  );
};
