import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '~/lib/cn';
import { Paging } from '~/lib/paging';
import { IconButton } from '../IconButton';

interface PagerProps {
  paging: Pick<Paging, 'label' | 'page' | 'hasPrev' | 'hasNext'>;
  onPage: (page: number) => void;
  // What it steps through, for the buttons' names: "Previous page", "Next categories"
  of?: string;
  // Under a table, or under a tile's legend: smaller, with a line above
  variant?: 'table' | 'legend';
}

/* "1–8 of 11", with previous and next */
export const Pager = ({ paging, onPage, of = 'page', variant = 'table' }: PagerProps) => {
  const legend = variant === 'legend';
  const button = legend ? 'ghost' : 'outline';
  const disabled = legend ? undefined : 'disabled:cursor-default disabled:opacity-40';

  return (
    <div
      className={cn(
        'flex items-center',
        legend ? 'justify-between gap-3 border-t border-border pt-2' : 'gap-2 md:gap-3'
      )}>
      <span className={cn('num font-semibold text-muted', legend ? 'text-xs' : 'text-[13px]')}>
        {paging.label}
      </span>
      <span className={cn('flex', legend ? 'gap-1' : 'gap-2 md:gap-3')}>
        <IconButton
          variant={button}
          aria-label={`Previous ${of}`}
          disabled={!paging.hasPrev}
          onClick={() => onPage(paging.page - 1)}
          className={disabled}>
          <ChevronLeft size={18} aria-hidden="true" />
        </IconButton>
        <IconButton
          variant={button}
          aria-label={`Next ${of}`}
          disabled={!paging.hasNext}
          onClick={() => onPage(paging.page + 1)}
          className={disabled}>
          <ChevronRight size={18} aria-hidden="true" />
        </IconButton>
      </span>
    </div>
  );
};
