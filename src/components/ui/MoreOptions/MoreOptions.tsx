import { ReactNode, useId } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { cn } from '~/lib/cn';

interface MoreOptionsProps {
  // What's set inside, in one line, so nothing folded away is a surprise
  summary: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

/*
 * The fields in a form most people leave as they are, folded into one row that says what they're
 * set to. Open, they sit in a panel joined to the row.
 */
export const MoreOptions = ({ summary, open, onOpenChange, children }: MoreOptionsProps) => {
  const panelId = useId();

  return (
    <div className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => onOpenChange(!open)}
        className={cn(
          'flex min-h-[58px] w-full cursor-pointer items-center gap-3 border border-border bg-surface-2 py-2.5 pr-3.5 pl-4 text-left transition-colors hover:border-border-strong',
          open ? 'rounded-t-[18px] border-b-transparent' : 'rounded-[18px]'
        )}>
        <SlidersHorizontal size={18} className="shrink-0 text-muted" aria-hidden="true" />
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-bold">More options</span>
          <span className="text-xs leading-[1.35] font-semibold text-muted">{summary}</span>
        </span>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-muted transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={panelId}
          className="flex flex-col gap-[18px] rounded-b-[18px] border border-t-0 border-border bg-surface-2 px-4 pt-1 pb-4">
          {children}
        </div>
      ) : null}
    </div>
  );
};
