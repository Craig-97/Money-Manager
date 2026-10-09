import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { Forecast } from '../../../hooks';

/* Which rows are showing, with previous and next */
export const Pager = ({ forecast }: { forecast: Forecast }) => {
  const { firstRow, rows, totalRows, page, pages, setPage } = forecast;
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <span className="num text-[13px] font-semibold text-muted">
        {firstRow + 1}–{firstRow + rows.length} of {totalRows}
      </span>
      <IconButton
        variant="outline"
        aria-label="Previous page"
        disabled={page === 0}
        onClick={() => setPage(page - 1)}
        className="disabled:cursor-default disabled:opacity-40">
        <ChevronLeft size={18} aria-hidden="true" />
      </IconButton>
      <IconButton
        variant="outline"
        aria-label="Next page"
        disabled={page >= pages - 1}
        onClick={() => setPage(page + 1)}
        className="disabled:cursor-default disabled:opacity-40">
        <ChevronRight size={18} aria-hidden="true" />
      </IconButton>
    </div>
  );
};
