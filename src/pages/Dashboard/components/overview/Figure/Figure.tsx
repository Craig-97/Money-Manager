import { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { formatBalance } from '~/lib/format';
import { OverdrawnPill } from '../OverdrawnPill';

interface FigureProps {
  label: string;
  amount: number;
  note: ReactNode;
}

export const Figure = ({ label, amount, note }: FigureProps) => (
  <div className="relative flex min-w-0 flex-col gap-1.5">
    <p className="text-[13px] font-semibold text-muted">{label}</p>
    {amount < 0 ? <OverdrawnPill className="absolute top-0 right-0" /> : null}
    <p className={cn('num text-[22px] leading-[1.1] font-extrabold', amount < 0 && 'text-expense')}>
      {formatBalance(amount)}
    </p>
    <p className="text-xs font-medium text-muted">{note}</p>
  </div>
);
