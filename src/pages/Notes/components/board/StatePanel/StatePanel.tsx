import { ReactNode } from 'react';
import { cn } from '~/lib/cn';

interface StatePanelProps {
  icon: ReactNode;
  title: string;
  text?: string;
  action: ReactNode;
  tone?: 'dashed' | 'error';
}

/* A message in place of the board: no notes, no matches, or an error */
export const StatePanel = ({ icon, title, text, action, tone = 'dashed' }: StatePanelProps) => (
  <div
    role={tone === 'error' ? 'alert' : undefined}
    className={cn(
      'flex flex-col items-center gap-3 rounded-3xl px-6 py-12 text-center',
      tone === 'error'
        ? 'border border-border bg-surface'
        : 'border border-dashed border-border-strong'
    )}>
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex size-12 items-center justify-center rounded-2xl',
        tone === 'error'
          ? 'bg-expense-bg text-expense'
          : 'border border-border bg-surface text-muted'
      )}>
      {icon}
    </span>
    <h2 className="text-base font-bold">{title}</h2>
    {text ? <p className="max-w-[320px] text-sm font-medium text-muted">{text}</p> : null}
    {action}
  </div>
);
