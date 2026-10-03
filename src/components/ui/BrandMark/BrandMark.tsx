import { cn } from '~/lib/cn';

/* The £ logo mark */
export const BrandMark = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      'flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-text text-base font-extrabold text-bg',
      className
    )}>
    £
  </span>
);
