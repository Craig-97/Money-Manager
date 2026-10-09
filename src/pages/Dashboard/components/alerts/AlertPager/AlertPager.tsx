import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';

interface AlertPagerProps {
  index: number;
  count: number;
  onGo: (index: number) => void;
}

/* Desktop: previous and next, with which alert this is */
export const AlertPager = ({ index, count, onGo }: AlertPagerProps) => (
  <div className="hidden items-center gap-0.5 border-l border-border pl-2.5 md:flex">
    <IconButton aria-label="Previous alert" disabled={index === 0} onClick={() => onGo(index - 1)}>
      <ChevronLeft size={16} strokeWidth={2.25} aria-hidden="true" />
    </IconButton>
    <span aria-live="polite" className="num text-xs font-bold whitespace-nowrap text-muted">
      {index + 1} of {count}
    </span>
    <IconButton
      aria-label="Next alert"
      disabled={index >= count - 1}
      onClick={() => onGo(index + 1)}>
      <ChevronRight size={16} strokeWidth={2.25} aria-hidden="true" />
    </IconButton>
  </div>
);
