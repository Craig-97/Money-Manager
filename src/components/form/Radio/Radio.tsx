import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';

/* A native radio button in the design's style. Group radios with the same name. */
export const Radio = ({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) => (
  <input
    type="radio"
    className={cn(
      'm-0 grid size-[22px] shrink-0 cursor-pointer appearance-none place-content-center rounded-full border-[1.5px] border-border-strong bg-surface transition-colors hover:border-muted',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong',
      "checked:border-accent checked:bg-accent checked:after:size-2 checked:after:rounded-full checked:after:bg-on-accent checked:after:content-['']",
      className
    )}
    {...props}
  />
);
