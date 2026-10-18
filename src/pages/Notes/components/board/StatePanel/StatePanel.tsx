import { ReactNode } from 'react';

interface StatePanelProps {
  icon: ReactNode;
  title: string;
  text?: string;
  action: ReactNode;
}

/* A message in place of the board: no notes, or no matches */
export const StatePanel = ({ icon, title, text, action }: StatePanelProps) => (
  <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border-strong px-6 py-12 text-center">
    <span
      aria-hidden="true"
      className="inline-flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted">
      {icon}
    </span>
    <h2 className="text-base font-bold">{title}</h2>
    {text ? <p className="max-w-[320px] text-sm font-medium text-muted">{text}</p> : null}
    {action}
  </div>
);
