import { ApproximatelyEqual } from '~/components/payments/PaymentParts';
import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { Recurring } from '../../hooks';
import { signedTotal } from '../../recurringModel';

const statClasses = 'flex min-w-0 flex-col gap-2.5 px-7 py-[26px]';
const labelClasses = 'text-[13px] font-semibold text-muted';
const figureClasses = 'num text-[32px] leading-[1.1] font-extrabold';
const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/* Desktop: monthly recurring, what's still to pay before payday, and renewals coming up */
export const SummaryStats = ({ recurring }: { recurring: Recurring }) => {
  const { totals, renewals, cycle, today } = recurring;
  const next = renewals.shown.find(item => !item.renewal.passed);

  return (
    <section
      aria-label="Summary"
      className={cn(
        tileLift,
        'grid grid-cols-1 rounded-3xl border border-border bg-surface min-[56.25rem]:grid-cols-3 [&>*+*]:border-t [&>*+*]:border-border min-[56.25rem]:[&>*+*]:border-t-0 min-[56.25rem]:[&>*+*]:border-l'
      )}>
      <div className={statClasses}>
        <h2 className={labelClasses}>Monthly recurring</h2>
        <p className={figureClasses}>
          <ApproximatelyEqual averaged={totals.averaged} />
          {signedTotal(totals.monthly)}
          <span className="text-sm font-semibold tracking-normal text-muted"> /mo</span>
        </p>
        <p className="text-[13px] font-medium text-muted">
          {totals.annual > 0 ? (
            <>
              + <span className="num font-bold text-text">{formatMoney(totals.annual)}</span>/yr
              annual ·{' '}
            </>
          ) : null}
          {plural(totals.count, 'recurring payment')}
        </p>
      </div>

      <div className={statClasses}>
        <h2 className={labelClasses}>Still to pay before payday</h2>
        <p className={figureClasses}>{signedTotal(totals.stillToPay)}</p>
        <p className="text-[13px] font-medium text-muted">
          {plural(totals.inCycle, 'payment')} by {formatShortDate(cycle.end, today)}
        </p>
      </div>

      <div className={statClasses}>
        <h2 className={labelClasses}>Renewals coming up</h2>
        <p className={figureClasses}>{renewals.count}</p>
        <p className="truncate text-[13px] font-medium text-muted">
          {next ? (
            <>
              Next:{' '}
              <span className="font-bold text-text">
                {next.payment.name}, {formatShortDate(next.renewal.date, today)}
              </span>
            </>
          ) : (
            'None set'
          )}
        </p>
      </div>
    </section>
  );
};
