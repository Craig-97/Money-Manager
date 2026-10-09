import { nextSort, sortDescription, sortLabel } from '~/lib/payments';
import { SortProps } from '../sortProps';

/* Mobile: one button that steps through Date ↑, Date ↓, Amount ↓ and Name A–Z */
export const MobileSortButton = ({ sort, onSort }: SortProps) => (
  <button
    type="button"
    onClick={() => onSort(nextSort(sort))}
    aria-label={sortDescription(sort)}
    className="inline-flex h-11 cursor-pointer items-center rounded-full px-3 text-sm font-semibold whitespace-nowrap text-muted hover:bg-hover">
    {sortLabel(sort)}
  </button>
);
