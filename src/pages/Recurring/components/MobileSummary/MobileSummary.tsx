import { ApproximatelyEqual } from '~/components/payments/PaymentParts';
import { formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { Recurring } from '../../hooks';
import { signedTotal } from '../../recurringModel';

const rowClasses = 'flex items-end justify-between gap-3 px-1.5 py-3';

/* Mobile: monthly recurring and what's still to pay before payday, stacked in one tile */
export const MobileSummary = ({ recurring }: { recurring: Recurring }) => {
  const { totals, cycle, today } = recurring;

  return (
    <section
      aria-label="Summary"
      className="flex flex-col rounded-3xl border border-border bg-surface px-3.5 py-1.5 [&>*+*]:border-t [&>*+*]:border-border">
      <div className={rowClasses}>
        <div>
          <h2 className="text-xs font-semibold text-muted">Monthly recurring</h2>
          <p className="mt-1 num text-2xl font-extrabold">
            <ApproximatelyEqual averaged={totals.averaged} hint={false} />
            {signedTotal(totals.monthly)}
          </p>
        </div>
        {totals.annual > 0 ? (
          <p className="text-right text-xs font-medium text-muted">
            + <span className="num font-bold text-text">{formatMoney(totals.annual)}</span>
            <br />
            /yr annual
          </p>
        ) : null}
      </div>
      <div className={rowClasses}>
        <div>
          <h2 className="text-xs font-semibold text-muted">Still to pay before payday</h2>
          <p className="mt-1 num text-2xl font-extrabold">{signedTotal(totals.stillToPay)}</p>
        </div>
        <p className="text-right text-xs font-medium text-muted">
          {totals.inCycle} {totals.inCycle === 1 ? 'payment' : 'payments'}
          <br />
          by {formatShortDate(cycle.end, today)}
        </p>
      </div>
    </section>
  );
};
