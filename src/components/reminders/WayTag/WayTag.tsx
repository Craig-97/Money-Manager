import { ReactNode } from 'react';
import { cn } from '~/lib/cn';

const tagClasses =
  'inline-flex h-[26px] shrink-0 items-center rounded-full px-2.5 text-xs font-bold';

/* "Always on", "On" in green; "Later" greyed */
export const WayTag = ({ tone, children }: { tone: 'on' | 'later'; children: ReactNode }) => (
  <span
    className={cn(
      tagClasses,
      tone === 'on' ? 'bg-income-bg text-income' : 'border border-border bg-surface-2 text-muted'
    )}>
    {children}
  </span>
);
