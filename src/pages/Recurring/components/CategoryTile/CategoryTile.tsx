import { useState } from 'react';
import { Pager, SegmentedControl, tileLift } from '~/components/ui';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { pageOf } from '~/lib/paging';
import { Recurring } from '../../hooks';
import { CATEGORY_PERIODS, CategoryPeriod, signedTotal } from '../../recurringModel';
import { CategoryBar } from '../CategoryBar';
import { CategoryLegend } from '../CategoryLegend';

interface CategoryTileProps {
  recurring: Recurring;
  // Beside the renewals, or on mobile: one column, four at a time. Full width: two columns of four.
  narrow: boolean;
  compact?: boolean;
}

/*
 * Recurring payments by category, a year or a month of them: one bar, and a legend that pages so
 * the height holds. A month leaves quarterly and yearly payments out, giving them as a yearly
 * figure under the total.
 */
export const CategoryTile = ({ recurring, narrow, compact = false }: CategoryTileProps) => {
  const { breakdown, categoryPeriod: period } = recurring;
  const [page, setPage] = useState(0);
  const pageSize = narrow ? 4 : 8;
  const legend = pageOf(breakdown.items, { size: pageSize, page });
  if (!recurring.hasCategories) return null;

  // The categories change between a year and a month, so the legend starts again
  const changePeriod = (next: CategoryPeriod) => {
    recurring.setCategoryPeriod(next);
    setPage(0);
  };

  return (
    <section
      aria-labelledby="categories-title"
      className={cn(
        'flex flex-col gap-3 rounded-3xl border border-border bg-surface',
        compact ? 'p-3.5' : cn(tileLift, 'p-5')
      )}>
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="flex min-w-0 flex-col gap-0.5">
          <h2
            id="categories-title"
            className={cn(
              'font-extrabold tracking-[-0.02em]',
              compact ? 'text-base' : 'text-[19px]'
            )}>
            By category
          </h2>
          <p className="text-xs font-semibold text-muted">
            {breakdown.averaged ? '≈ ' : null}
            <span className={cn('num font-bold', breakdown.net >= 0 ? 'text-income' : 'text-text')}>
              {signedTotal(breakdown.net)}
            </span>{' '}
            a {period}
            {breakdown.annual > 0 ? (
              <>
                {' '}
                · + <span className="num font-bold text-text">{formatMoney(breakdown.annual)}</span>
                /yr annual
              </>
            ) : null}
          </p>
        </div>
        <SegmentedControl
          aria-label="Show categories by"
          value={period}
          onValueChange={changePeriod}
          options={CATEGORY_PERIODS}
          className="shrink-0"
        />
      </div>
      {breakdown.spending.length ? (
        <CategoryBar spending={breakdown.spending} period={period} />
      ) : null}
      {breakdown.items.length ? null : (
        <p className="px-1 pb-2 text-[13px] font-medium text-muted">
          Only quarterly and yearly payments, which aren't counted by the month.
        </p>
      )}
      <div className="flex flex-1 flex-col gap-2">
        <CategoryLegend
          items={legend.items}
          columns={narrow ? 1 : 2}
          // Every page keeps a full page's height, so paging doesn't resize the tile
          slots={legend.paged ? pageSize : 0}
        />
        {legend.paged ? (
          <Pager paging={legend} onPage={setPage} of="categories" variant="legend" />
        ) : null}
      </div>
    </section>
  );
};
