import { clearedText } from '~/lib/debts';
import { formatMoney, splitPence } from '~/lib/format';
import { biggestDebts } from '../../debtsModel';
import { Debts } from '../../hooks';

/* Mobile: the accent card with what's left, split by debt */
export const MobileDebtsHero = ({ debts: model }: { debts: Debts }) => {
  const { debts, totals, base, today } = model;
  const [whole, pence] = splitPence(totals.left);
  const chips = biggestDebts(debts);
  const shares = debts
    .toSorted((a, b) => b.debt.balance - a.debt.balance)
    .filter(debt => debt.debt.balance > 0);

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
        <span className="inline-flex items-center rounded-full bg-hero-chip px-[11px] py-[7px] text-xs font-bold">
          {base.months === null
            ? 'Not cleared yet'
            : `Debt-free ${clearedText(base.months, today)}`}
        </span>
      </div>
      <p className="relative num text-[56px] leading-none font-extrabold tracking-[-0.05em]">
        {whole}
        <span className="text-[0.42em] tracking-[-0.02em] text-hero-muted">{pence}</span>
      </p>
      {totals.left > 0 ? (
        <div aria-hidden="true" className="relative flex h-2 gap-1">
          {shares.map((debt, index) => (
            <span
              key={debt.id}
              style={{ flexGrow: debt.debt.balance }}
              className={index === 0 ? 'rounded-full bg-hero-text' : 'rounded-full bg-hero-text/50'}
            />
          ))}
        </div>
      ) : null}
      <ul className="relative grid grid-cols-3 gap-2">
        {chips.map((chip, index) => (
          <li
            key={chip.id}
            className="flex min-w-0 flex-col gap-0.5 rounded-2xl bg-hero-chip px-3 py-2.5">
            <span className="flex items-center gap-1.5 truncate text-xs font-semibold text-hero-muted">
              <span
                aria-hidden="true"
                className={
                  index === 0
                    ? 'size-1.5 rounded-full bg-hero-text'
                    : 'size-1.5 rounded-full bg-hero-text/50'
                }
              />
              {chip.label}
            </span>
            <span className="num text-[15px] font-extrabold">
              {formatMoney(chip.balance, { whole: true })}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
};
