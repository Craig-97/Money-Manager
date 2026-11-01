import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';

interface ActionRowProps {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  // A chevron at the end, for one that opens something bigger, like the full form
  chevron?: boolean;
}

/* One of the rows under a quick view's tiles: Add a note, View debt, Edit payment */
export const ActionRow = ({ icon, children, onClick, chevron = false }: ActionRowProps) => (
  <button
    type="button"
    onClick={onClick}
    className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-3 text-left text-[15px] font-bold transition-colors hover:bg-hover">
    <span aria-hidden="true" className="text-muted">
      {icon}
    </span>
    <span className="flex-1">{children}</span>
    {chevron ? <ChevronRight size={16} className="text-muted" aria-hidden="true" /> : null}
  </button>
);
