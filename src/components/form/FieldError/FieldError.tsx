import { ReactNode } from 'react';
import { CircleAlert } from 'lucide-react';
import { cn } from '~/lib/cn';

interface FieldErrorProps {
  // Point the input's aria-describedby at this id
  id: string;
  children: ReactNode;
  // md is used under the larger sign in and register fields
  size?: 'sm' | 'md';
  // Announce the message as soon as it appears, for errors that come back from the API
  alert?: boolean;
  className?: string;
}

/* A field's error message, with an icon so it doesn't rely on colour alone */
export const FieldError = ({
  id,
  children,
  size = 'sm',
  alert = false,
  className
}: FieldErrorProps) => (
  <p
    id={id}
    role={alert ? 'alert' : undefined}
    className={cn(
      'mt-2 flex items-start leading-[1.4] text-expense',
      size === 'sm' ? 'gap-1.5 text-xs font-bold' : 'gap-[7px] text-[13px] font-semibold',
      className
    )}>
    <CircleAlert size={size === 'sm' ? 14 : 16} className="mt-px shrink-0" aria-hidden="true" />
    {children}
  </p>
);
