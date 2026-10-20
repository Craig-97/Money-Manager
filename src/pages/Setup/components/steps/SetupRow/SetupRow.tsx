import { Trash2 } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';

interface SetupRowProps {
  name: string;
  // The line under the name, e.g. "Monthly · Thu 25 Oct · Into Cash ISA"
  details: string;
  amount: string;
  tone?: 'income' | 'expense' | 'plain';
  onOpen: () => void;
  // Left out, it's removed from its dialog instead
  onRemove?: () => void;
}

/*
 * One account or payment in setup's lists, like the rows on the Accounts and Recurring pages.
 * Tapping it opens it to change; details wrap rather than cut off.
 */
export const SetupRow = ({
  name,
  details,
  amount,
  tone = 'plain',
  onOpen,
  onRemove
}: SetupRowProps) => (
  <div className="flex items-center gap-1 border-t border-border first:border-t-0">
    <button
      type="button"
      onClick={onOpen}
      aria-label={`Edit ${name}`}
      aria-haspopup="dialog"
      className="flex min-h-16 min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[18px] px-2.5 py-2 text-left transition-colors hover:bg-hover">
      <span
        aria-hidden="true"
        className={cn(
          'inline-flex size-10 shrink-0 items-center justify-center rounded-[13px] text-[15px] font-extrabold',
          tone === 'income'
            ? 'bg-income-bg text-income'
            : tone === 'expense'
              ? 'bg-expense-bg text-expense'
              : 'border border-border bg-surface-2'
        )}>
        {(name.trim() || '?').charAt(0).toUpperCase()}
      </span>
      <span className="flex min-w-0 grow flex-col gap-[3px]">
        <span className="text-[15px] font-bold [overflow-wrap:anywhere]">{name}</span>
        {details ? (
          <span className="text-xs leading-[1.35] font-semibold [overflow-wrap:anywhere] text-muted">
            {details}
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          'shrink-0 num text-[15px] font-extrabold whitespace-nowrap',
          tone === 'income' && 'text-income',
          tone === 'expense' && 'text-expense'
        )}>
        {amount}
      </span>
    </button>
    {onRemove ? (
      <IconButton aria-label={`Remove ${name}`} onClick={onRemove}>
        <Trash2 size={18} aria-hidden="true" />
      </IconButton>
    ) : null}
  </div>
);
