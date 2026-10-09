import { ReactNode } from 'react';
import { cn } from '~/lib/cn';

export const StepNumber = ({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-extrabold text-accent-text md:size-8 md:text-[13px]',
      className
    )}>
    {children}
  </span>
);
