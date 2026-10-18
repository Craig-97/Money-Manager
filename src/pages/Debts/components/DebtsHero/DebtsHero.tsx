import { Calendar } from 'lucide-react';
import { clearedText } from '~/lib/debts';
import { formatBalance, formatMoney, splitPence } from '~/lib/format';
import { Debts } from '../../hooks';

const chipClasses = 'flex min-w-0 flex-col gap-1 rounded-[18px] bg-hero-chip px-3.5 py-3';

/* Desktop: the accent card with what's left to pay, and how it's worked out */
export const DebtsHero = ({ debts: model }: { debts: Debts }) => {
  const { debts, totals, base, interest, today } = model;
  const [whole, pence] = splitPence(totals.left);
  const count = `${debts.length} ${debts.length === 1 ? 'debt' : 'debts'}`;

  return (
    <article
      aria-label="Left to pay"
      className="relative flex min-w-0 flex-col gap-6 overflow-hidden rounded-3xl bg-hero-bg p-7 text-hero-text transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_var(--shadow)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[110px] -right-[90px] size-[300px] rounded-full bg-hero-chip"
      />
      <div className="relative flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-hero-muted">Left to pay</h2>
        <span className="inline-flex items-center gap-2 rounded-full bg-hero-chip px-3.5 py-2 text-[13px] font-bold">
          <Calendar size={15} strokeWidth={2.25} aria-hidden="true" />
          {base.months === null ? 'Not cleared at these payments' : 'Debt-free'}
          {base.months === null ? null : <span>{clearedText(base.months, today)}</span>}
        </span>
      </div>

      <div className="relative">
        <p className="num text-[84px] leading-[0.95] font-extrabold tracking-[-0.05em]">
          {whole}
          <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">{pence}</span>
        </p>
        <p className="mt-3.5 text-[15px] font-semibold text-hero-muted">
          <span className="num font-extrabold text-hero-text">
            {formatMoney(totals.monthly, { whole: true })}
          </span>{' '}
          a month across {count}
          {interest > 0 ? (
            <>
              {' '}
              · about{' '}
              <span className="num font-extrabold text-hero-text">
                {formatMoney(interest, { whole: true })}
              </span>{' '}
              of it is interest
            </>
          ) : null}
        </p>
      </div>

      <div
        role="group"
        aria-label="How what's left is worked out"
        className="relative mt-auto grid grid-cols-[minmax(0,1fr)_20px_minmax(0,1fr)_20px_minmax(0,1fr)] items-stretch gap-2">
        <div className={chipClasses}>
          <span className="text-xs font-semibold text-hero-muted">Started at</span>
          <p className="num text-lg font-extrabold">{formatMoney(totals.started)}</p>
        </div>
        <span
          aria-hidden="true"
          className="flex items-center justify-center text-xl font-bold text-hero-muted">
          −
        </span>
        <div className={chipClasses}>
          <span className="text-xs font-semibold text-hero-muted">Paid off</span>
          <p className="num text-lg font-extrabold">{formatMoney(totals.paidOff)}</p>
          <p className="text-xs font-medium text-hero-muted">
            {Math.round(totals.paidOffShare * 100)}% so far
          </p>
        </div>
        <span
          aria-hidden="true"
          className="flex items-center justify-center text-xl font-bold text-hero-muted">
          =
        </span>
        <div className="flex min-w-0 flex-col gap-1 rounded-[18px] bg-hero-text px-3.5 py-3 text-hero-ink">
          <span className="text-xs font-bold opacity-70">Left to pay</span>
          <p className="num text-lg font-extrabold">{formatBalance(totals.left)}</p>
        </div>
      </div>
    </article>
  );
};
