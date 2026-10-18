import { ProgressRing } from '~/components/debts';
import { Tile } from '~/components/ui/Tile';
import { formatMoney, formatPayment } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { Debts } from '../../hooks';

/* Desktop: how much is paid off so far, and which debts are due before payday */
export const PaidOffTile = ({ debts: model }: { debts: Debts }) => {
  const { totals, paidThisCycle, dueBeforePayday, dueAfterPayday, today } = model;
  const nextAfter = dueAfterPayday[0];

  return (
    <Tile aria-labelledby="paid-off-title" className="gap-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="paid-off-title" className="text-[15px] font-bold text-muted">
          Paid off
        </h2>
        {paidThisCycle > 0 ? (
          <span className="rounded-full bg-accent-soft px-3 py-1.5 text-[13px] font-bold text-accent-text">
            Up {formatMoney(paidThisCycle, { whole: true })} since payday
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-5">
        <ProgressRing share={totals.paidOffShare} />
        <div className="min-w-0">
          <p className="num text-[28px] leading-none font-extrabold tracking-[-0.03em]">
            {formatMoney(totals.paidOff, { whole: true })}
          </p>
          <p className="mt-1.5 text-[13px] font-semibold text-muted">
            of {formatMoney(totals.started, { whole: true })} paid off
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5 border-t border-border pt-4">
        <h3 className="text-[13px] font-semibold text-muted">Due before payday</h3>
        {dueBeforePayday.length ? (
          <ul className="flex flex-col gap-1">
            {dueBeforePayday.map(debt => (
              <li
                key={debt.id}
                className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 py-1.5">
                <span className="truncate text-sm font-bold">{debt.name}</span>
                <span className="text-[13px] font-semibold text-muted">
                  {formatShortDate(debt.dueDate!, today)}
                </span>
                <span className="w-[84px] text-right num text-sm font-extrabold text-expense">
                  {formatPayment(debt.signedAmount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm font-semibold">Nothing due before payday</p>
        )}
        {nextAfter ? (
          <p className="text-xs font-medium text-muted">
            {nextAfter.name} is next due {formatShortDate(nextAfter.dueDate!, today)}, after payday.
          </p>
        ) : null}
      </div>
    </Tile>
  );
};
