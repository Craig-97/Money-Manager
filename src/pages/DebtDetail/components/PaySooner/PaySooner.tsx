import { PayoffChart } from '~/components/debts';
import { Button } from '~/components/ui/Button';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { DebtDetailModel } from '../../hooks';

const cardClasses =
  'flex min-w-0 flex-col gap-1 rounded-[18px] border border-border bg-surface-2 p-4';

/* Some extra each month, and what it does to when the debt clears and the interest on it */
export const PaySooner = ({ detail }: { detail: DebtDetailModel }) => {
  const { debt, extra, setExtra, maxExtra, base, plan, clearBy, sooner, saved } = detail;

  return (
    <section aria-label="Pay sooner" className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4">
        <div className="flex items-center justify-between gap-3">
          <label htmlFor="pay-sooner-extra" className="text-[15px] font-bold">
            Pay extra each month
          </label>
          <span aria-hidden="true" className="num text-lg font-extrabold text-accent-text">
            +{formatMoney(extra, { whole: true })}
          </span>
        </div>
        <input
          id="pay-sooner-extra"
          type="range"
          min={0}
          max={maxExtra}
          step={10}
          value={extra}
          onChange={event => setExtra(Number(event.target.value))}
          aria-valuetext={`${formatMoney(extra, { whole: true })} extra a month`}
          className="h-6 w-full cursor-pointer accent-accent"
        />
        <div aria-live="polite" className="grid grid-cols-2 gap-2.5">
          <div className={cardClasses}>
            <span className="text-[13px] font-semibold text-muted">Cleared</span>
            <span className="num text-[22px] leading-tight font-extrabold">{clearBy}</span>
            <span className="text-xs font-semibold text-muted">{sooner}</span>
          </div>
          <div className={cardClasses}>
            <span className="text-[13px] font-semibold text-muted">Interest to pay</span>
            <span className="num text-[22px] leading-tight font-extrabold">
              {formatMoney(plan.interest, { whole: true })}
            </span>
            <span
              className={cn(
                'text-xs font-semibold',
                saved === 'Same as now' ? 'text-muted' : 'text-income'
              )}>
              {saved}
            </span>
          </div>
        </div>
        <PayoffChart
          base={base.series}
          plan={plan.series}
          label={`${debt.name} falls to nothing by ${clearBy}`}
        />
      </div>
      {detail.applyLabel ? (
        <Button
          variant="accent"
          onClick={detail.apply}
          loading={detail.applying}
          className="h-[52px] w-full">
          {detail.applyLabel}
        </Button>
      ) : null}
      <p className="px-2 text-center text-xs font-medium text-muted">
        Estimates from your {debt.debt.apr.toFixed(1)}% APR. Your statement is the final word.
      </p>
    </section>
  );
};
