import { ReactNode } from 'react';

interface KitSectionProps {
  title: string;
  // Where the design uses it, so it can be compared with the artboard
  source: string;
  children: ReactNode;
}

export const KitSection = ({ title, source, children }: KitSectionProps) => (
  <section className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6">
    <header className="flex flex-wrap items-baseline justify-between gap-2">
      <h2 className="text-xl font-extrabold tracking-[-0.03em]">{title}</h2>
      <p className="text-xs font-semibold text-muted">{source}</p>
    </header>
    {children}
  </section>
);

/* A labelled example within a section */
export const KitExample = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-2">
    <p className="text-xs font-bold tracking-wide text-faint uppercase">{label}</p>
    <div className="flex flex-wrap items-start gap-3">{children}</div>
  </div>
);
