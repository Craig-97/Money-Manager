import { ReactNode } from 'react';

/* One line of what moving the payday changes: a label, then the figure */
export const PreviewRow = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-baseline justify-between gap-4 text-[13px]">
    <span className="shrink-0 font-semibold text-muted">{label}</span>
    <span className="text-right num font-extrabold">{children}</span>
  </div>
);
