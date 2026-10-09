import { ChevronLeft, ChevronRight } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';

interface LegendPagerProps {
  // "1–8 of 11"
  label: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}

/* Steps through the legend a page at a time, so the tile keeps its height */
export const LegendPager = ({ label, hasPrev, hasNext, onPrev, onNext }: LegendPagerProps) => (
  <div className="flex items-center justify-between gap-3 border-t border-border pt-2">
    <span className="num text-xs font-semibold text-muted">{label}</span>
    <span className="flex gap-1">
      <IconButton aria-label="Previous categories" disabled={!hasPrev} onClick={onPrev}>
        <ChevronLeft size={18} aria-hidden="true" />
      </IconButton>
      <IconButton aria-label="Next categories" disabled={!hasNext} onClick={onNext}>
        <ChevronRight size={18} aria-hidden="true" />
      </IconButton>
    </span>
  </div>
);
