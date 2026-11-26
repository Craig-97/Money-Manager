import { ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '~/lib/cn';
import { TourTarget, tourTarget } from '../../../tour/tourSteps';
import { Button, tileLift } from '../../../ui';
import { SortMenu } from '../../PaymentControls';
import { SortProps } from '../../PaymentControls/sortProps';

interface PaymentsTileProps extends SortProps {
  headingId: string;
  // The lists it can show, beside the title
  tabs: ReactNode;
  onAdd: () => void;
  // Says what Add adds, when the button alone doesn't
  addLabel?: string;
  className?: string;
  // What the first-time tour calls it, on a page the tour visits
  tour?: TourTarget;
  children: ReactNode;
}

/* Desktop: the Payments tile, its title with the tabs, then Add and the sort menu */
export const PaymentsTile = ({
  headingId,
  tabs,
  onAdd,
  addLabel,
  sort,
  onSort,
  className,
  tour,
  children
}: PaymentsTileProps) => (
  <article
    aria-labelledby={headingId}
    {...(tour ? tourTarget(tour) : undefined)}
    className={cn(
      tileLift,
      'flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5',
      className
    )}>
    <div className="flex flex-wrap items-center justify-between gap-3 px-1">
      <div className="flex flex-wrap items-center gap-4">
        <h2 id={headingId} className="scroll-mt-6 text-[19px] font-extrabold tracking-[-0.02em]">
          Payments
        </h2>
        {tabs}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          onClick={onAdd}
          aria-label={addLabel}
          className="text-[13px] text-accent-text">
          <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
          Add
        </Button>
        <SortMenu sort={sort} onSort={onSort} />
      </div>
    </div>
    {children}
  </article>
);
