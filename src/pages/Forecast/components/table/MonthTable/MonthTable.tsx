import { Select } from '~/components/form/Select';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatShortDay } from '~/lib/dates';
import { formatBalance, formatMoney } from '~/lib/format';
import { signedMoney, TABLE_MONTHS } from '../../../forecastModel';
import { Forecast, ROWS_PER_PAGE, RowsPerPage } from '../../../hooks';
import { BankHolidayTag } from '../BankHolidayTag';
import { ChangeTag } from '../ChangeTag';
import { NowTag } from '../NowTag';
import { Pager } from '../Pager';

const TIMING = [
  { value: 'before', label: 'Before payday' },
  { value: 'after', label: 'After payday' }
] as const;

const gridClasses =
  'grid grid-cols-[minmax(0,1.3fr)_minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)] items-center gap-4 rounded-2xl px-4';

/* The balance month by month for two years, before or after each payday */
export const MonthTable = ({
  forecast,
  compact = false
}: {
  forecast: Forecast;
  compact?: boolean;
}) => {
  const { rows, afterPayday, setAfterPayday, spend, perPage, setPerPage, net } = {
    ...forecast,
    net: forecast.projection.net
  };
  const timing = (
    <SegmentedControl
      aria-label="Balance timing"
      size="lg"
      value={afterPayday ? 'after' : 'before'}
      onValueChange={value => setAfterPayday(value === 'after')}
      options={[...TIMING]}
      fullWidth={compact}
    />
  );

  return (
    <section
      className={cn(
        tileLift,
        'flex flex-col gap-3 rounded-3xl border border-border bg-surface',
        compact ? 'px-4 pt-5 pb-4' : 'px-5 pt-6 pb-5'
      )}>
      <div
        className={cn(
          'flex justify-between gap-4 px-1',
          compact ? 'items-baseline' : 'flex-wrap items-center pb-2'
        )}>
        <div>
          <h2 className="text-[17px] font-extrabold tracking-[-0.02em] md:text-lg">
            Month by month
          </h2>
          {compact ? null : (
            <p className="mt-1 text-[13px] text-muted">
              {TABLE_MONTHS}-month projection at{' '}
              <span className="num font-bold text-text">{formatMoney(spend, { whole: true })}</span>
              /mo spend
            </p>
          )}
        </div>
        {compact ? (
          <span className="num text-xs font-semibold text-muted">{TABLE_MONTHS} months</span>
        ) : (
          timing
        )}
      </div>
      {compact ? timing : null}

      {compact ? (
        <ul className="px-1">
          {rows.map((row, index) => (
            <li
              key={row.month}
              className={cn('flex items-center gap-3 py-3', index > 0 && 'border-t border-border')}>
              <div className="flex min-w-0 grow flex-col gap-0.5">
                <span className="flex items-center gap-1.5 text-[15px] font-bold">
                  {row.month}
                  {row.isNow ? <NowTag className="px-[7px] py-0.5 text-[10px]" /> : null}
                </span>
                <span className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted">
                  Payday {row.payday ? formatShortDay(row.payday) : '—'}
                  <BankHolidayTag row={row} className="h-5 px-2 text-[10px]" />
                </span>
              </div>
              <div className="flex flex-col items-end gap-0.5">
                <span className="num text-[15px] font-extrabold">{formatBalance(row.balance)}</span>
                <ChangeTag row={row} className="px-2 py-[3px] text-[11px]" />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div role="table" aria-label="Month by month">
          <div
            role="row"
            className={cn(
              gridClasses,
              'min-h-10 text-xs font-bold tracking-[0.04em] text-faint uppercase'
            )}>
            <span role="columnheader">Month</span>
            <span role="columnheader">Payday</span>
            <span role="columnheader" className="text-right">
              Balance
            </span>
            <span role="columnheader" className="text-right">
              Growth
            </span>
          </div>
          {rows.map(row => (
            <div
              key={row.month}
              role="row"
              className={cn(
                gridClasses,
                'min-h-16 border-t border-border transition-colors hover:bg-hover'
              )}>
              <span role="cell" className="flex min-w-0 items-center gap-2 text-[15px] font-bold">
                {row.month}
                {row.isNow ? <NowTag className="px-2 py-[3px] text-[11px]" /> : null}
              </span>
              <span
                role="cell"
                className="flex min-w-0 flex-wrap items-center gap-2 text-sm font-semibold text-muted">
                {row.payday ? formatShortDay(row.payday) : '—'}
                <BankHolidayTag row={row} className="h-[22px] px-[9px] text-[11px]" />
              </span>
              <span role="cell" className="text-right num text-[15px] font-extrabold">
                {formatBalance(row.balance)}
              </span>
              <span role="cell" className="text-right">
                <ChangeTag row={row} className="px-2.5 py-1 text-xs" />
              </span>
            </div>
          ))}
        </div>
      )}

      <div
        className={cn(
          'flex items-center justify-between gap-4 border-t border-border',
          compact ? 'px-1 pt-3' : 'flex-wrap px-1 pt-4'
        )}>
        {compact ? null : (
          <div className="flex items-center gap-2.5">
            <label htmlFor="forecast-rows" className="text-[13px] font-semibold text-muted">
              Rows per page
            </label>
            <Select
              id="forecast-rows"
              variant="pill"
              value={String(perPage)}
              onValueChange={value => setPerPage(Number(value) as RowsPerPage)}
              options={ROWS_PER_PAGE.map(n => ({ value: String(n), label: String(n) }))}
            />
          </div>
        )}
        <Pager forecast={forecast} />
      </div>
      <span className="sr-only">Each month changes by {signedMoney(net)}</span>
    </section>
  );
};
