import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { CategoryShare } from '../../recurringModel';

interface CategoryLegendProps {
  items: CategoryShare[];
  columns: 1 | 2;
  // Rows to keep room for, so a short last page is as tall as a full one and nothing jumps
  slots?: number;
}

/*
 * Each category with its colour, a year's amount and its share of money out. Categories that
 * bring money in show in green with a plus, outside the bar.
 */
export const CategoryLegend = ({ items, columns, slots = 0 }: CategoryLegendProps) => (
  <ul className={cn('grid gap-x-6', columns === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
    {items.map(item => {
      const incoming = item.colour === null;
      return (
        <li
          key={item.category}
          className="flex min-h-[42px] min-w-0 items-center gap-2.5 border-t border-border text-[13px]">
          <span
            aria-hidden="true"
            className={cn('size-2.5 shrink-0 rounded-[3px]', incoming && 'bg-income')}
            style={item.colour ? { background: item.colour } : undefined}
          />
          <span className="min-w-0 flex-1 truncate font-semibold" title={item.label}>
            {item.label}
          </span>
          <span className={cn('num font-bold', incoming && 'text-income')}>
            {incoming ? '+' : ''}
            {formatMoney(item.yearly)}
          </span>
          <span className="w-9 text-right num text-xs font-semibold text-muted">
            {incoming ? '' : `${Math.round(item.share! * 100)}%`}
          </span>
        </li>
      );
    })}
    {Array.from({ length: Math.max(0, slots - items.length) }, (_, index) => (
      <li key={`empty-${index}`} aria-hidden="true" className="min-h-[42px]" />
    ))}
  </ul>
);
