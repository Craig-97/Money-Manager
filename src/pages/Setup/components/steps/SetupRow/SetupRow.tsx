import { ChevronRight, Trash2 } from 'lucide-react';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';
import { useSetupDesktop } from '../../../hooks';

interface SetupRowProps {
  name: string;
  // The line under the name, e.g. "Monthly · Subscription" or "Savings · 4.5%"
  details: string;
  amount: string;
  // Payments show money in or out in colour; accounts are plain, with a chevron on desktop
  tone: 'income' | 'expense' | 'account';
  // Under the amount on desktop, e.g. "Next Tue 2 Nov"
  next?: string;
  onOpen: () => void;
  // Left out, it's removed from its dialog instead
  onRemove?: () => void;
}

/*
 * One account or payment in setup's lists. Tapping it opens it to change; details wrap rather than
 * cut off. On desktop the rows sit apart without dividers; on mobile they run edge to edge in their
 * card with a line between each, as the boards draw them.
 */
export const SetupRow = ({
  name,
  details,
  amount,
  tone,
  next,
  onOpen,
  onRemove
}: SetupRowProps) => {
  const isDesktop = useSetupDesktop();
  const isAccount = tone === 'account';

  return (
    <div
      className={cn(
        'flex items-center gap-1',
        isDesktop
          ? 'rounded-[18px] transition-colors hover:bg-hover'
          : cn('border-t border-border pl-4', isAccount ? 'pr-4' : 'pr-1')
      )}>
      <button
        type="button"
        onClick={onOpen}
        aria-label={`Edit ${name}`}
        aria-haspopup="dialog"
        className={cn(
          'group flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left',
          isDesktop ? 'min-h-16 rounded-[18px] px-2.5 py-2' : 'min-h-[68px] rounded-[14px] py-2.5'
        )}>
        <span
          aria-hidden="true"
          className={cn(
            'inline-flex shrink-0 items-center justify-center font-extrabold',
            isDesktop ? 'rounded-xl text-sm' : 'size-10 rounded-[13px] text-[15px]',
            isDesktop && (isAccount ? 'size-[38px]' : 'size-9'),
            tone === 'income' && 'bg-income-bg text-income',
            tone === 'expense' && 'bg-expense-bg text-expense',
            isAccount &&
              (isDesktop ? 'border border-border bg-surface-2' : 'bg-accent-soft text-accent-text')
          )}>
          {(name.trim() || '?').charAt(0).toUpperCase()}
        </span>
        <span className={cn('flex min-w-0 grow flex-col', isDesktop ? 'gap-0.5' : 'gap-[3px]')}>
          <span
            className={cn(
              'font-bold [overflow-wrap:anywhere]',
              isDesktop
                ? 'text-sm'
                : 'text-[15px] leading-[1.3] decoration-border-strong underline-offset-[3px] group-hover:underline'
            )}>
            {name}
          </span>
          {details ? (
            <span
              className={cn(
                'text-xs leading-[1.4] [overflow-wrap:anywhere] text-muted',
                isDesktop ? 'font-medium' : 'font-semibold'
              )}>
              {details}
            </span>
          ) : null}
        </span>
        <span className="flex shrink-0 flex-col items-end gap-0.5">
          <span
            className={cn(
              'num font-extrabold whitespace-nowrap',
              isDesktop ? 'text-sm' : 'text-[15px]',
              tone === 'income' && 'text-income',
              tone === 'expense' && 'text-expense'
            )}>
            {amount}
          </span>
          {isDesktop && next ? (
            <span className="text-xs font-medium whitespace-nowrap text-muted">{next}</span>
          ) : null}
        </span>
        {isDesktop && isAccount ? (
          <ChevronRight
            size={16}
            strokeWidth={2.25}
            className="shrink-0 text-muted"
            aria-hidden="true"
          />
        ) : null}
      </button>
      {onRemove ? (
        <IconButton aria-label={`Remove ${name}`} onClick={onRemove}>
          <Trash2 size={18} aria-hidden="true" />
        </IconButton>
      ) : null}
    </div>
  );
};
