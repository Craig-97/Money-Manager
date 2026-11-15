import { ReactNode } from 'react';
import { cn } from '~/lib/cn';

interface PaymentListFootProps {
  // "4 payments before payday · Fri 27 Nov"
  label: string;
  compact?: boolean;
  // Their total
  children: ReactNode;
}

/* Under a list of payments: how many it shows, then their total */
export const PaymentListFoot = ({ label, compact = false, children }: PaymentListFootProps) => (
  <div
    className={cn(
      'flex items-center justify-between gap-3 border-t border-border',
      compact ? 'mt-1 px-2.5 pt-3.5 pb-1.5' : 'mt-2.5 px-4 pt-4 pb-1 pl-5'
    )}>
    <p className="text-[13px] font-semibold text-muted">{label}</p>
    {children}
  </div>
);
