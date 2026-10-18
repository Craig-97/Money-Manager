import { ProgressRing } from '~/components/debts';
import { formatMoney } from '~/lib/format';
import { Debts } from '../../hooks';

/* Mobile: how much is paid off so far, and since payday, under the hero */
export const MobilePaidOff = ({ debts }: { debts: Debts }) => {
  const { totals, paidThisCycle } = debts;

  return (
    <section
      aria-label="Paid off"
      className="flex items-center gap-3.5 rounded-3xl border border-border bg-surface p-3.5">
      <ProgressRing share={totals.paidOffShare} size={52} />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="text-[15px] font-bold">
          <span className="num font-extrabold">{formatMoney(totals.paidOff, { whole: true })}</span>{' '}
          <span className="font-semibold text-muted">
            of {formatMoney(totals.started, { whole: true })} paid off
          </span>
        </p>
        {paidThisCycle > 0 ? (
          <span className="self-start rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent-text">
            {formatMoney(paidThisCycle, { whole: true })} paid off since payday
          </span>
        ) : null}
      </div>
    </section>
  );
};
