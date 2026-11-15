import { ReactNode } from 'react';

/* A labelled example within a section */
export const KitExample = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-bold tracking-wide text-faint uppercase">{label}</p>
    <div className="flex flex-wrap items-start gap-3">{children}</div>
  </div>
);
