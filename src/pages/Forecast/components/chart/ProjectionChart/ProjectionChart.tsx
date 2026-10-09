import { ArrowUp } from 'lucide-react';
import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatBalance, formatMoney } from '~/lib/format';
import { axisLabel, chartScale, impactText, PROJECTION_MONTHS } from '../../../forecastModel';
import { Forecast } from '../../../hooks';
import { Legend } from '../Legend';

const SHORT_MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec'
];

/* Months along the bottom: every month on desktop, every third on mobile */
const monthLabels = (today: Date, every: number) =>
  Array.from({ length: PROJECTION_MONTHS + 1 }, (_, i) => i)
    .filter(i => i % every === 0)
    .map(i => {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const label =
        i === PROJECTION_MONTHS
          ? `${SHORT_MONTHS[date.getMonth()]} ’${String(date.getFullYear()).slice(2)}`
          : SHORT_MONTHS[date.getMonth()];
      return { label, left: (i / PROJECTION_MONTHS) * 100 };
    });

/*
 * The balance before each payday over the next year at the chosen spend, against paying
 * recurring payments alone. Drawn as an SVG that stretches to fit; the dots and labels sit on top.
 */
export const ProjectionChart = ({
  forecast,
  compact = false
}: {
  forecast: Forecast;
  compact?: boolean;
}) => {
  const { projection, spend, recurring, summary, today, yearLabel } = forecast;
  const { atSpend, recurringOnly, inAYear } = projection;
  const { min, max, lines } = chartScale([...atSpend, ...recurringOnly]);
  const yPercent = (value: number) => ((max - value) / (max - min)) * 100;
  const x = (i: number) => ((i / PROJECTION_MONTHS) * 1000).toFixed(1);
  const y = (value: number) => (yPercent(value) * 10).toFixed(1);
  const path = (values: number[]) =>
    values.map((v, i) => `${i ? 'L' : 'M'}${x(i)} ${y(v)}`).join(' ');
  const line = path(atSpend);
  const zeroY = y(Math.max(min, 0));
  const endY = yPercent(inAYear);

  const label = `Line chart: projected balance before payday goes from ${formatBalance(summary.freeToSpend, { whole: true })} today to ${formatBalance(inAYear, { whole: true })} in ${yearLabel} at ${formatMoney(spend, { whole: true })} monthly spend, versus ${formatBalance(recurringOnly[PROJECTION_MONTHS], { whole: true })} if you only paid recurring payments.`;

  return (
    <section
      className={cn(
        tileLift,
        'flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5 md:gap-5 md:p-6 min-[68.8125rem]:col-span-2'
      )}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-[17px] font-extrabold tracking-[-0.02em] md:text-lg">
            12-month projection
          </h2>
          <p className="mt-0.5 text-xs text-muted md:mt-1 md:text-[13px]">
            Balance the day before each payday
          </p>
        </div>
        {compact ? null : <Legend spend={spend} recurring={recurring} />}
      </div>

      <div
        role="img"
        aria-label={label}
        className={cn(
          'relative',
          compact ? 'mt-2.5 mr-2 ml-10 h-[190px]' : 'mt-2 mr-6 ml-14 h-[300px]'
        )}>
        {lines.map(value => (
          <div key={value} style={{ top: `${yPercent(value)}%` }} className="absolute inset-x-0">
            <div className="h-0 border-t border-border" />
            <span
              className={cn(
                'absolute -translate-y-1/2 text-right num font-semibold text-faint',
                compact ? '-left-10 w-8 text-[11px]' : '-left-14 w-11 text-xs'
              )}>
              {axisLabel(value)}
            </span>
          </div>
        ))}
        <svg
          viewBox="0 0 1000 1000"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 size-full overflow-visible">
          <path
            d={`${line} L1000 ${zeroY} L0 ${zeroY} Z`}
            className="fill-accent stroke-none opacity-14"
          />
          <path
            d={path(recurringOnly)}
            className="fill-none stroke-faint [stroke-width:2] [stroke-dasharray:6_6] [vector-effect:non-scaling-stroke]"
          />
          <path
            d={line}
            className="fill-none stroke-accent [stroke-width:3] [stroke-linecap:round] [stroke-linejoin:round] [vector-effect:non-scaling-stroke]"
          />
        </svg>
        <span
          aria-hidden="true"
          style={{ left: 0, top: `${yPercent(atSpend[0])}%` }}
          className={cn(
            'absolute rounded-full border-[3px] border-accent bg-surface',
            compact ? '-mt-[5px] -ml-[5px] size-2.5' : '-mt-1.5 -ml-1.5 size-3'
          )}
        />
        {compact ? null : (
          <>
            <span
              style={{ top: `calc(${yPercent(atSpend[0])}% - 28px)` }}
              className="absolute left-3 text-xs font-semibold whitespace-nowrap text-muted">
              Today{' '}
              <span className="num font-bold text-text">
                {formatBalance(summary.freeToSpend, { whole: true })}
              </span>
            </span>
            <span
              aria-hidden="true"
              style={{ left: '100%', top: `${yPercent(recurringOnly[PROJECTION_MONTHS])}%` }}
              className="absolute -mt-[5px] -ml-[5px] size-2.5 rounded-full bg-faint"
            />
          </>
        )}
        <span
          aria-hidden="true"
          style={{ left: '100%', top: `${endY}%` }}
          className={cn(
            'absolute rounded-full bg-accent',
            compact
              ? '-mt-[7px] -ml-[7px] size-3.5 shadow-[0_0_0_4px_var(--accent-soft)]'
              : '-mt-2 -ml-2 size-4 shadow-[0_0_0_5px_var(--accent-soft)]'
          )}
        />
        <div
          style={{
            top: endY < 22 ? `calc(${endY}% + 16px)` : `calc(${endY}% - ${compact ? 48 : 66}px)`
          }}
          className={cn(
            'absolute flex flex-col items-end gap-0.5 bg-pill-active-bg text-pill-active-text shadow-[0_12px_24px_-12px_var(--shadow)]',
            compact ? 'right-3 rounded-xl px-2.5 py-1.5' : 'right-[18px] rounded-[14px] px-3 py-2'
          )}>
          {compact ? null : (
            <span className="text-[11px] font-semibold opacity-70">
              {yearLabel.replace(/^(\w{3})\w*/, '$1')}
            </span>
          )}
          <span className={cn('num font-extrabold', compact ? 'text-sm' : 'text-base')}>
            {formatBalance(inAYear, { whole: true })}
          </span>
        </div>
      </div>
      <div className={cn('relative', compact ? 'mr-2 ml-10 h-4' : 'mr-6 ml-14 h-[18px]')}>
        {monthLabels(today, compact ? 3 : 1).map(month => (
          <span
            key={month.left}
            style={{ left: `${month.left}%` }}
            className={cn(
              'absolute top-0 -translate-x-1/2 font-semibold whitespace-nowrap text-faint',
              compact ? 'text-[11px]' : 'text-xs'
            )}>
            {month.label}
          </span>
        ))}
      </div>

      {compact ? <Legend spend={spend} recurring={recurring} compact /> : null}

      <p
        className={cn(
          'flex items-center gap-3 rounded-[14px] border border-border bg-surface-2 text-muted md:mt-auto md:rounded-2xl md:px-4 md:py-3.5 md:text-[13px]',
          compact ? 'px-3.5 py-3 text-xs leading-normal' : 'leading-normal'
        )}>
        {compact ? null : (
          <span
            aria-hidden="true"
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] border border-border bg-surface">
            <ArrowUp size={16} />
          </span>
        )}
        <span>{impactText(spend, recurring)}</span>
      </p>
    </section>
  );
};
