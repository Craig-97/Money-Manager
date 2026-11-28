import { cn } from '~/lib/cn';

export const OverdrawnPill = ({
  children = 'Overdrawn',
  className
}: {
  children?: string;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex h-5 items-center rounded-full bg-expense-bg px-2 text-[10px] font-bold whitespace-nowrap text-expense',
      className
    )}>
    {children}
  </span>
);
