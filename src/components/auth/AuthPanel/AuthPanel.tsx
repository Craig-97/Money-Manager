import { ReactNode } from 'react';

interface AuthPanelProps {
  title: string;
  lead: string;
  // Shown under the lead, e.g. the steps of the journey
  children?: ReactNode;
}

/* The brand panel's heading, pinned to the bottom of the panel, and anything under it */
export const AuthPanel = ({ title, lead, children }: AuthPanelProps) => (
  <>
    <div className="relative mt-auto max-w-[520px]">
      <h2 className="text-5xl leading-[1.05] font-extrabold tracking-[-0.045em]">{title}</h2>
      <p className="mt-4 text-[17px] leading-[1.55] font-medium text-hero-muted">{lead}</p>
    </div>
    {children}
  </>
);
