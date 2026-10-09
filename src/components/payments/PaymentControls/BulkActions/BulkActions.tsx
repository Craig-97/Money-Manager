import { ReactNode } from 'react';
import { Check, Trash } from 'lucide-react';
import { Button } from '~/components/ui/Button';

export interface BulkActionsProps {
  // The select all checkbox, which stays in place as the row changes
  selectAll: ReactNode;
  count: number;
  onPay: () => void;
  onDelete: () => void;
  onClear: () => void;
}

/* Desktop: takes the place of the column headings while payments are ticked */
export const BulkActions = ({ selectAll, count, onPay, onDelete, onClear }: BulkActionsProps) => (
  <div
    role="row"
    className="flex min-h-[52px] flex-wrap items-center gap-2.5 rounded-2xl bg-accent-soft px-2">
    {selectAll}
    <p className="mr-1.5 num text-sm font-extrabold text-accent-text">{count} selected</p>
    <span aria-hidden="true" className="h-6 w-px bg-border-strong" />
    <Button variant="solid" className="text-[13px]" onClick={onPay}>
      <Check size={16} strokeWidth={2.5} aria-hidden="true" />
      Mark as paid
    </Button>
    <Button variant="danger" className="text-[13px]" onClick={onDelete}>
      <Trash size={16} aria-hidden="true" />
      Delete
    </Button>
    <Button variant="ghost" onClick={onClear} className="ml-auto text-[13px]">
      Clear
    </Button>
  </div>
);
