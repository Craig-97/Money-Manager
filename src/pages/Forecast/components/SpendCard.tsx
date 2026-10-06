import { Info } from 'lucide-react';
import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatMoney, MINUS } from '~/lib/format';
import { signedMoney, spendHelper } from '../forecastModel';
import { Forecast } from '../hooks';

const wholeNumber = new Intl.NumberFormat('en-GB');

/* What the person expects to spend a month: typed, slid or picked */
export const SpendCard = ({
  forecast,
  compact = false
}: {
  forecast: Forecast;
  compact?: boolean;
}) => {
  const { spend, spendMax, setSpend, income, recurring, projection } = forecast;
  const chips = [
    {
      label: `Recurring (${formatMoney(recurring, { whole: true })})`,
      value: Math.round(recurring)
    },
    { label: '£1,000', value: 1000 },
    { label: '£1,500', value: 1500 }
  ];

  const net = (
    <span
      className={cn(
        'num text-xl font-extrabold',
        projection.net < 0 ? 'text-expense' : 'text-income'
      )}>
      {signedMoney(projection.net)}
    </span>
  );

  return (
    <section
      className={cn(
        tileLift,
        'flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5 md:gap-[18px] md:p-6'
      )}>
      <div className="flex items-baseline justify-between gap-2">
        <div>
          <h2 className="text-[17px] font-extrabold tracking-[-0.02em] md:text-lg">
            Monthly spend
          </h2>
          {compact ? null : (
            <p className="mt-1 text-[13px] leading-normal text-muted">
              What you expect to spend each month, recurring payments included.
            </p>
          )}
        </div>
        {compact ? <span className="text-xs font-semibold text-muted">incl. recurring</span> : null}
      </div>

      <div className="flex flex-col gap-2">
        {compact ? null : (
          <label htmlFor="forecast-spend" className="text-[13px] font-semibold text-muted">
            Spend per month
          </label>
        )}
        <div className="flex h-16 items-center gap-1.5 rounded-[18px] border border-border bg-surface-2 px-5 transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
          <span
            aria-hidden="true"
            className="num text-[28px] font-extrabold text-muted md:text-[30px]">
            £
          </span>
          <input
            id="forecast-spend"
            aria-label={compact ? 'Monthly spend in pounds' : undefined}
            inputMode="numeric"
            autoComplete="off"
            value={wholeNumber.format(spend)}
            onChange={event => setSpend(Number(event.target.value.replace(/[^0-9]/g, '')) || 0)}
            className="w-full min-w-0 flex-1 border-0 bg-transparent p-0 num text-[28px] font-extrabold tracking-[-0.03em] text-text outline-none md:text-[30px]"
          />
          <span className="text-[13px] font-semibold text-muted md:text-sm">/mo</span>
        </div>
      </div>

      <div>
        <input
          type="range"
          aria-label="Monthly spend slider"
          min={0}
          max={spendMax}
          step={10}
          value={spend}
          onChange={event => setSpend(Number(event.target.value))}
          className="h-11 w-full cursor-pointer accent-accent"
        />
        <div className="relative flex justify-between num text-xs font-semibold text-faint">
          <span>£0</span>
          {income > 0 ? (
            // Where the income sits, so spending past it is easy to see
            <span
              className="absolute -translate-x-1/2"
              style={{ left: `${(income / spendMax) * 100}%` }}>
              {formatMoney(income, { whole: true })}
              {compact ? '' : ' income'}
            </span>
          ) : null}
          <span>{formatMoney(spendMax, { whole: true })}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 md:gap-2">
        {chips.map(chip => (
          <button
            key={chip.label}
            type="button"
            aria-pressed={spend === chip.value}
            onClick={() => setSpend(chip.value)}
            className="h-11 cursor-pointer rounded-full border border-border-strong bg-transparent px-4 num text-[13px] font-semibold text-text transition-colors hover:bg-hover aria-pressed:border-pill-active-bg aria-pressed:bg-pill-active-bg aria-pressed:text-pill-active-text">
            {chip.label}
          </button>
        ))}
      </div>

      <p className="flex gap-2.5 rounded-[14px] bg-accent-soft px-3.5 py-3 text-[13px] leading-normal md:rounded-2xl md:px-4 md:py-3.5">
        <Info size={18} className="mt-px shrink-0 text-accent-text" aria-hidden="true" />
        <span>
          Your recurring payments total{' '}
          <strong className="num">{formatMoney(recurring, { whole: true })}/mo</strong> —{' '}
          {spendHelper(spend, recurring)}
        </span>
      </p>

      {compact ? (
        <div className="flex items-baseline justify-between border-t border-border pt-3">
          <span className="text-sm font-bold">Net each month</span>
          {net}
        </div>
      ) : (
        <div className="mt-auto flex flex-col gap-2.5 border-t border-border pt-3.5 text-sm">
          <div className="flex justify-between font-medium text-muted">
            <span>Monthly income</span>
            <span className="num font-bold text-income">+{formatMoney(income)}</span>
          </div>
          <div className="flex justify-between font-medium text-muted">
            <span>Monthly spend</span>
            <span className="num font-bold text-expense">
              {MINUS}
              {formatMoney(spend)}
            </span>
          </div>
          <div className="flex items-baseline justify-between font-bold">
            <span>Net each month</span>
            {net}
          </div>
        </div>
      )}
    </section>
  );
};
