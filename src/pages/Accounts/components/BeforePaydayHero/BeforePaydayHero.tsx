import { daysBetween } from '~/lib/dates';
import { formatBalance, formatMoney, splitPence } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { Accounts } from '../../hooks';

const chipClasses = 'flex min-w-0 flex-col gap-1 rounded-[18px] bg-hero-chip px-3.5 py-3';
const opClasses = 'flex items-center justify-center text-xl font-bold text-hero-muted';

/*
 * What the accounts to spend from have left by payday, once their own payments go out, with the sum
 * underneath as the Balances view shows its own: balance now − goes out = left at payday. Money
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
  const count = beforePayday.spending.length;
  const chips = [
    { label: 'Balance now', value: formatBalance(beforePayday.now) },
    { label: 'Goes out', value: formatMoney(beforePayday.goesOut) },
    { label: compact ? 'Left' : 'Left at payday', value: formatBalance(beforePayday.left) }
  ];
  const across = `Across ${count} spending ${count === 1 ? 'account' : 'accounts'}, once their own payments go out.`;

  return (
    <article
      aria-label="Left at payday"
      className={
        compact
          ? 'relative flex flex-col gap-3.5 overflow-hidden rounded-3xl bg-hero-bg p-[22px] text-hero-text'
          : 'relative flex min-w-0 flex-col gap-6 overflow-hidden rounded-3xl bg-hero-bg p-7 text-hero-text'
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
          className={`num leading-[0.95] font-extrabold tracking-[-0.05em] ${compact ? 'text-[52px]' : 'text-[84px]'}`}>
          {whole}
          <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">{pence}</span>
        </p>
        <p
          className={`font-semibold text-hero-muted ${compact ? 'mt-3 text-[13px] leading-[1.45]' : 'mt-3.5 text-[15px]'}`}>
          {across}
        </p>
      </div>

      {compact ? (
        // On a phone the sum drops its signs so each figure has room
        <div
          role="group"
          aria-label="How it is worked out"
          className="relative grid grid-cols-3 gap-2">
          {chips.map(chip => (
            <div
              key={chip.label}
              className="flex min-w-0 flex-col gap-1 rounded-[16px] bg-hero-chip px-3 py-2.5">
              <span className="text-[11px] font-bold text-hero-muted">{chip.label}</span>
              <span className="num text-[13px] font-extrabold whitespace-nowrap">{chip.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <div
          role="group"
          aria-label="How it is worked out"
          className="relative mt-auto grid grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)_14px_minmax(0,1fr)] items-stretch gap-1.5 md:grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_20px_minmax(0,1fr)] md:gap-2">
          {chips.map((chip, index) => (
            <div key={chip.label} className="contents">
              {index ? (
                <span aria-hidden="true" className={opClasses}>
                  {index === 1 ? '−' : '='}
                </span>
              ) : null}
              <div className={chipClasses}>
                <span className="text-xs font-semibold text-hero-muted">{chip.label}</span>
                <p className="num text-base font-extrabold [overflow-wrap:anywhere] md:text-lg">
                  {chip.value}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
};
