import { ReactNode } from 'react';
import { LucideIcon, X } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';

const TONES = {
  expense: 'bg-expense-bg text-expense',
  accent: 'bg-accent-soft text-accent-text',
  income: 'bg-income-bg text-income',
  warn: 'bg-warn-bg text-warn'
} as const;

interface AlertProps {
  icon: LucideIcon;
  tone: keyof typeof TONES;
  title: ReactNode;
  subline: ReactNode;
  // Puts it away for a while
  onLater: () => void;
  // What to do about it, solid, after Later
  action: { label: string; icon: LucideIcon; onClick: () => void; opensDialog?: boolean };
  // Clears it, as in Reminders. Left out for one that stays until it's dealt with.
  onClear?: () => void;
  // Names it for the clear button: "Clear: Energy is due today"
  clearLabel?: string;
}

/*
 * One alert in a stack: its icon, what it's about, then Later and what to do. One that can be
 * cleared has × after them on desktop, and in the card's corner on a phone.
 */
export const Alert = ({
  icon: Icon,
  tone,
  title,
  subline,
  onLater,
  action,
  onClear,
  clearLabel
}: AlertProps) => {
  const ActionIcon = action.icon;

  return (
    <>
      <div
        className={cn(
          'flex min-w-0 grow items-center gap-3 md:min-w-[200px] md:gap-4',
          onClear && 'pr-9 md:pr-0'
        )}>
        <span
          className={cn(
            'inline-flex size-10 shrink-0 items-center justify-center rounded-full md:size-11',
            TONES[tone]
          )}>
          <Icon size={20} className="size-[18px] md:size-5" aria-hidden="true" />
        </span>
        {/* The text wraps rather than cutting anything short */}
        <div className="min-w-0">
          <p className="text-[15px] leading-[1.4] font-bold">{title}</p>
          <p className="mt-0.5 text-xs leading-[1.45] font-medium text-muted md:text-[13px]">
            {subline}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-1.5">
        {/* Quiet on desktop, a full button on a phone */}
        <Button
          onClick={onLater}
          className="border-border bg-surface-2 md:border-transparent md:bg-transparent md:text-muted">
          Later
        </Button>
        <Button
          variant="solid"
          onClick={action.onClick}
          aria-haspopup={action.opensDialog ? 'dialog' : undefined}>
          <ActionIcon size={16} aria-hidden="true" />
          {action.label}
        </Button>
        {/* In the card's corner on a phone, where the buttons fill the row; after them on desktop */}
        {onClear ? (
          <IconButton
            aria-label={clearLabel ? `Clear: ${clearLabel}` : 'Clear'}
            onClick={onClear}
            className="absolute top-2 right-2 size-10 md:static">
            <X size={17} strokeWidth={2.25} aria-hidden="true" />
          </IconButton>
        ) : null}
      </div>
    </>
  );
};
