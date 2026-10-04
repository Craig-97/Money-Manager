import { ReactNode } from 'react';
import { CalendarDays, CreditCard, TrendingUp } from 'lucide-react';
import { Tile } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatBalance, formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { signedMoney, signedPercent } from '../forecastModel';
import { Forecast } from '../hooks';

const Badge = ({ children }: { children: ReactNode }) => (
  <span
    aria-hidden="true"
    className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted">
    {children}
  </span>
);

const bigNumber = 'num text-4xl leading-none font-extrabold';

const growthClass = (net: number) => (net < 0 ? 'text-expense' : 'text-income');

/* Desktop: free to spend, payday balance, monthly growth and where it'll be in a year */
export const KeyFigures = ({ forecast }: { forecast: Forecast }) => {
  const { summary, cycle, projection, cycleProgress } = forecast;
  const { growthPercent, yearPercent, net, inAYear } = projection;

  return (
    <section
      aria-label="Key figures"
      className="grid gap-4 min-[35rem]:grid-cols-2 min-[68.8125rem]:grid-cols-4">
      <Tile className="gap-4">
        <div className="flex items-center gap-2.5">
          <Badge>
            <CreditCard size={18} />
          </Badge>
          <span className="text-[13px] font-semibold text-muted">Free to spend</span>
        </div>
        <p className={bigNumber}>{formatBalance(summary.freeToSpend, { whole: true })}</p>
        <div className="mt-auto flex flex-wrap gap-1.5 text-xs font-semibold">
          <span className="rounded-full border border-border bg-surface-2 px-2.5 py-[5px] text-muted">
            <span className="num text-text">
              {formatBalance(forecast.bankBalance, { whole: true })}
            </span>{' '}
            bank
          </span>
          <span className="rounded-full bg-expense-bg px-2.5 py-[5px] num text-expense">
            {formatMoney(summary.upcomingNet, { whole: true })} upcoming
          </span>
        </div>
      </Tile>

      <Tile className="gap-4">
        <div className="flex items-center gap-2.5">
          <Badge>
            <CalendarDays size={18} />
          </Badge>
          <span className="text-[13px] font-semibold text-muted">Payday balance</span>
        </div>
        <p className={bigNumber}>{formatBalance(summary.onPayday, { whole: true })}</p>
        <div className="mt-auto flex flex-col gap-2">
          <div className="flex justify-between text-xs font-semibold text-muted">
            <span>{formatShortDate(cycle.end)}</span>
            <span>in {summary.daysToPayday} days</span>
          </div>
          <div aria-hidden="true" className="h-1.5 overflow-hidden rounded-full bg-track">
            <div className="h-full rounded-full bg-accent" style={{ width: `${cycleProgress}%` }} />
          </div>
        </div>
      </Tile>

      <Tile className="gap-4">
        <div className="flex items-center gap-2.5">
          <Badge>
            <TrendingUp size={18} />
          </Badge>
          <span className="text-[13px] font-semibold text-muted">Monthly growth</span>
        </div>
        <p className={cn(bigNumber, growthClass(net))}>
          {growthPercent === null ? '—' : signedPercent(growthPercent)}
        </p>
        <p className="mt-auto text-[13px] font-medium text-muted">
          <span className={cn('num font-bold', growthClass(net))}>
            {signedMoney(net, { whole: true })}
          </span>{' '}
          net each month
        </p>
      </Tile>

      <Tile className="relative gap-4 overflow-hidden border-hero-bg bg-hero-bg text-hero-text hover:border-hero-bg">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-[70px] -right-[60px] size-[180px] rounded-full bg-hero-chip"
        />
        <div className="relative flex items-center justify-between gap-2.5">
          <span className="text-[13px] font-semibold text-hero-muted">In 12 months</span>
          {yearPercent === null ? null : (
            <span className="rounded-full bg-hero-chip px-2.5 py-1.5 num text-xs font-bold">
              {signedPercent(yearPercent, 0)}
            </span>
          )}
        </div>
        <p className={cn(bigNumber, 'relative')}>{formatBalance(inAYear, { whole: true })}</p>
        <p className="relative mt-auto text-[13px] font-medium text-hero-muted">
          By {forecast.yearLabel}, before payday
        </p>
      </Tile>
    </section>
  );
};

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
