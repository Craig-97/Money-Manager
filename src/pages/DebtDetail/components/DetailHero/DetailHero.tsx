import { DebtPayment, paidOffShare, startedAt } from '~/lib/debts';
import { formatMoney, splitPence } from '~/lib/format';

/* The accent card: what's left, how far it's paid off, and when it'll be cleared */
export const DetailHero = ({ debt, clearBy }: { debt: DebtPayment; clearBy: string }) => {
  const [whole, pence] = splitPence(debt.debt.balance);
  const started = startedAt(debt);
  const share = paidOffShare(debt);

  return (
    <article
      aria-label="Left to pay"
      className="relative flex flex-col gap-4 overflow-hidden rounded-3xl bg-hero-bg p-[22px] text-hero-text">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-[110px] -right-[90px] size-[220px] rounded-full bg-hero-chip"
      />
      <div className="relative flex items-center justify-between gap-2">
        <h2 className="text-[13px] font-bold text-hero-muted">Left to pay</h2>
        <span
          aria-live="polite"
          className="inline-flex items-center gap-1.5 rounded-full bg-hero-chip px-[11px] py-[7px] text-xs font-bold">
          {clearBy === 'Never' ? (
            'Not cleared at this payment'
          ) : (
            <>
              Clear by <span>{clearBy}</span>
            </>
          )}
        </span>
      </div>
      <p className="relative num text-[56px] leading-none font-extrabold tracking-[-0.05em]">
        {whole}
        <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">{pence}</span>
      </p>
      <div
        role="img"
        aria-label={`${Math.round(share * 100)}% paid off`}
        className="relative h-2 overflow-hidden rounded-full bg-hero-chip">
        <span
          className="block h-full rounded-full bg-hero-text"
          style={{ width: `${Math.round(share * 100)}%` }}
        />
      </div>
      <p className="relative flex justify-between gap-2 text-xs font-semibold text-hero-muted">
        <span>
          <span className="num font-extrabold text-hero-text">
            {formatMoney(started - debt.debt.balance, { whole: true })}
          </span>{' '}
          paid off
        </span>
        <span>Started at {formatMoney(started, { whole: true })}</span>
      </p>
    </article>
  );
};
