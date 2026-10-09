import { ReactNode } from 'react';
import { cn } from '~/lib/cn';

interface FigureRowProps {
  label: ReactNode;
  value: ReactNode;
  aside?: ReactNode;
  last?: boolean;
}

export const FigureRow = ({ label, value, aside, last }: FigureRowProps) => (
  <div className={cn('py-3.5', !last && 'border-b border-border')}>
    <div className="flex min-h-11 items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="flex items-center gap-2 text-[13px] font-semibold text-muted">{label}</p>
        <p className="mt-0.5 num text-2xl font-extrabold">{value}</p>
      </div>
      {aside ? (
        <div className="shrink-0 text-right text-xs font-medium text-muted">{aside}</div>
      ) : null}
    </div>
  </div>
);
