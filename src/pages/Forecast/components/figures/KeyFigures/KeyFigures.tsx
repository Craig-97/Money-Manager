import { CalendarDays, CreditCard, TrendingUp } from 'lucide-react';
import { Tile } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatBalance, formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { signedMoney, signedPercent } from '../../../forecastModel';
import { Forecast } from '../../../hooks';
import { Badge } from '../Badge';
import { growthClass } from '../keyFigureClasses';

const bigNumber = 'num text-4xl leading-none font-extrabold';

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
