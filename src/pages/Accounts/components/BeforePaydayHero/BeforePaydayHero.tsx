import { daysBetween } from '~/lib/dates';
import { formatBalance, formatMoney, splitPence } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { Accounts } from '../../hooks';

/*
 * What the accounts to spend from have left by payday, once their own payments go out. Money
 * moving between them doesn't change it.
 */
export const BeforePaydayHero = ({
  accounts: model,
  compact = false
}: {
  accounts: Accounts;
  compact?: boolean;
}) => {
  const { beforePayday, cycle, today } = model;
  const [whole, pence] = splitPence(beforePayday.left);
  const days = Math.max(0, daysBetween(today, cycle.end));

  return (
    <article
      aria-label="Left at payday"
      className={
        compact
          ? 'relative flex flex-col gap-3 overflow-hidden rounded-3xl bg-hero-bg p-[22px] text-hero-text'
          : 'relative flex min-w-0 flex-col gap-5 overflow-hidden rounded-3xl bg-hero-bg p-7 text-hero-text'
      }>
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -top-[110px] -right-[90px] rounded-full bg-hero-chip ${compact ? 'size-[220px]' : 'size-[300px]'}`}
      />
      <div className="relative flex flex-wrap items-center justify-between gap-2">
        <h2 className={`font-bold text-hero-muted ${compact ? 'text-[13px]' : 'text-[15px]'}`}>
          Left at payday
        </h2>
        <span className="inline-flex items-center rounded-full bg-hero-chip px-3 py-1.5 text-xs font-bold md:px-3.5 md:py-2 md:text-[13px]">
          Until {formatShortDate(cycle.end, today)} · {days} {days === 1 ? 'day' : 'days'}
        </span>
      </div>
      <div className="relative">
        <p
          className={`num leading-[0.95] font-extrabold tracking-[-0.05em] ${compact ? 'text-[48px]' : 'text-[72px]'}`}>
          {whole}
          <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">{pence}</span>
        </p>
        <p className="mt-3 text-[13px] font-semibold text-hero-muted md:text-[15px]">
          <span className="num font-extrabold text-hero-text">
            {formatBalance(beforePayday.now)}
          </span>{' '}
          now −{' '}
          <span className="num font-extrabold text-hero-text">
            {formatMoney(beforePayday.goesOut)}
          </span>{' '}
          going out, across {beforePayday.spending.length} spending accounts
        </p>
      </div>
    </article>
  );
};
