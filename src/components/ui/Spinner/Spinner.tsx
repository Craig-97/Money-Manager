import { cn } from '~/lib/cn';

/* A spinning ring in the current text colour. Decorative: pair it with visible or sr-only text. */
export const Spinner = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-block size-[18px] shrink-0 animate-[spin_0.8s_linear_infinite] rounded-full border-[2.5px] border-current/35 border-t-current',
      className
    )}
  />
);
