import { cn } from '~/lib/cn';
import { formatBalance, formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { signedMoney, signedPercent } from '../../../forecastModel';
import { Forecast } from '../../../hooks';
import { growthClass } from '../keyFigureClasses';

/* Mobile: the same four figures as a 2 by 2 grid */
export const MobileKeyFigures = ({ forecast }: { forecast: Forecast }) => {
  const { summary, cycle, projection } = forecast;
  const tile = 'flex flex-col gap-2.5 rounded-3xl border border-border bg-surface p-5';
  const number = 'num text-2xl leading-[1.1] font-extrabold';

  return (
    <section aria-label="Key figures" className="grid grid-cols-2 gap-2.5">
      <div className={tile}>
        <p className="text-[13px] font-semibold text-muted">Free to spend now</p>
        <p className={number}>{formatBalance(summary.freeToSpend, { whole: true })}</p>
        <p className="text-xs font-medium text-muted">
          <span className="num font-bold text-expense">
            {formatMoney(summary.upcomingNet, { whole: true })}
          </span>{' '}
          upcoming
        </p>
      </div>
      <div className={tile}>
        <p className="text-[13px] font-semibold text-muted">Payday balance</p>
        <p className={number}>{formatBalance(summary.onPayday, { whole: true })}</p>
        <p className="text-xs font-medium text-muted">
          {formatShortDate(cycle.end)} · {summary.daysToPayday} days
        </p>
      </div>
      <div className={tile}>
        <p className="text-[13px] font-semibold text-muted">Monthly growth</p>
        <p className={cn(number, growthClass(projection.net))}>
          {projection.growthPercent === null ? '—' : signedPercent(projection.growthPercent)}
        </p>
        <p className="text-xs font-medium text-muted">
          <span className={cn('num font-bold', growthClass(projection.net))}>
            {signedMoney(projection.net, { whole: true })}
          </span>
          /mo net
        </p>
      </div>
      <div
        className={cn(tile, 'relative overflow-hidden border-hero-bg bg-hero-bg text-hero-text')}>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[70px] -right-[60px] size-[180px] rounded-full bg-hero-chip"
        />
        <p className="relative text-xs font-semibold text-hero-muted">In 12 months</p>
        <p className={cn(number, 'relative')}>
          {formatBalance(projection.inAYear, { whole: true })}
        </p>
        {projection.yearPercent === null ? null : (
          <span className="relative self-start rounded-full bg-hero-chip px-2 py-1 num text-[11px] font-bold">
            {signedPercent(projection.yearPercent, 0)}
          </span>
        )}
      </div>
    </section>
  );
};
