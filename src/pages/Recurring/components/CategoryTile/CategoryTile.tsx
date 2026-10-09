import { useState } from 'react';
import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { CategoryBreakdown, pageOf } from '../../recurringModel';
import { CategoryBar } from '../CategoryBar';
import { CategoryLegend } from '../CategoryLegend';
import { LegendPager } from '../LegendPager';

interface CategoryTileProps {
  breakdown: CategoryBreakdown;
  // Beside the renewals, or on mobile: one column, four at a time. Full width: two columns of four.
  narrow: boolean;
  compact?: boolean;
}

/* A year of recurring payments by category: one bar, and a legend that pages so the height holds */
export const CategoryTile = ({ breakdown, narrow, compact = false }: CategoryTileProps) => {
  const [page, setPage] = useState(0);
  const pageSize = narrow ? 4 : 8;
  const legend = pageOf(breakdown.items, pageSize, page);
  if (!breakdown.items.length) return null;

  return (
    <section
      aria-labelledby="categories-title"
      className={cn(
        'flex flex-col gap-3 rounded-3xl border border-border bg-surface',
        compact ? 'p-3.5' : cn(tileLift, 'p-5')
      )}>
      <div className="flex items-baseline justify-between gap-3 px-1">
        <h2
          id="categories-title"
          className={cn(
            'font-extrabold tracking-[-0.02em]',
            compact ? 'text-base' : 'text-[19px]'
          )}>
          By category
        </h2>
        <span className="text-xs font-semibold text-muted">
          <span className={cn('num font-bold', breakdown.net >= 0 ? 'text-income' : 'text-text')}>
            {breakdown.net > 0 ? '+' : ''}
            {formatMoney(breakdown.net)}
          </span>{' '}
          a year
        </span>
      </div>
      {breakdown.spending.length ? <CategoryBar spending={breakdown.spending} /> : null}
      <div className="flex flex-1 flex-col gap-2">
        <CategoryLegend
          items={legend.items}
          columns={narrow ? 1 : 2}
          // Every page keeps a full page's height, so paging doesn't resize the tile
          slots={legend.paged ? pageSize : 0}
        />
        {legend.paged ? (
          <LegendPager
            label={legend.label}
            hasPrev={legend.hasPrev}
            hasNext={legend.hasNext}
            onPrev={() => setPage(legend.page - 1)}
            onNext={() => setPage(legend.page + 1)}
          />
        ) : null}
      </div>
    </section>
  );
};
