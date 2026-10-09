import { ReactNode } from 'react';

/* An icon in a small rounded square, beside a figure's label */
export const Badge = ({ children }: { children: ReactNode }) => (
  <span
    aria-hidden="true"
    className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted">
    {children}
  </span>
);
