import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';

/* A 44px touch target around a checkbox that has no visible label of its own */
export const CheckboxHitArea = ({ className, ...props }: ComponentProps<'label'>) => (
  <label
    className={cn(
      'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl',
      className
    )}
    {...props}
  />
);
