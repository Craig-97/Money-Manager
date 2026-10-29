import { ReactNode } from 'react';

interface SheetTileProps {
  icon: ReactNode;
  label: string;
  // A smaller line under the label, e.g. which date it ticks off
  detail?: string | null;
  onClick: () => void;
}

/*
 * One of the payment sheet's big buttons: an accent icon over its label. On its own it takes the
 * full width, rather than half with a gap beside it.
 */
export const SheetTile = ({ icon, label, detail, onClick }: SheetTileProps) => (
  <button
    type="button"
    // Read as one phrase, not the two lines run together
    aria-label={
      detail ? `${label}, ${detail.charAt(0).toLowerCase()}${detail.slice(1)}` : undefined
    }
    onClick={onClick}
    className="flex min-h-[76px] cursor-pointer flex-col items-start justify-center gap-2 rounded-[20px] border border-border bg-surface-2 px-3.5 py-3 text-left text-sm font-extrabold transition-colors only:col-span-2 hover:border-border-strong">
    <span aria-hidden="true" className="text-accent-text">
      {icon}
    </span>
    <span className="flex flex-col gap-0.5">
      {label}
      {detail ? <span className="text-[11px] font-semibold text-muted">{detail}</span> : null}
    </span>
  </button>
);
