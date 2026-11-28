import { ReactNode } from 'react';
import { cn } from '~/lib/cn';

interface FieldHintProps {
  // Point the input's aria-describedby at this id, when the hint explains the field
  id?: string;
  children: ReactNode;
  // Read out when it changes, for a hint that follows another choice
  live?: boolean;
  className?: string;
}

/* The grey line under a field saying what to put in it or what it does, where an error would go */
export const FieldHint = ({ id, children, live = false, className }: FieldHintProps) => (
  <p
    id={id}
    aria-live={live ? 'polite' : undefined}
    className={cn('mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted', className)}>
    {children}
  </p>
);
