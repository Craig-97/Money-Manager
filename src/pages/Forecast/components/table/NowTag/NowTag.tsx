import { cn } from '~/lib/cn';

/* Marks this month in the table */
export const NowTag = ({ className }: { className?: string }) => (
  <span className={cn('rounded-full bg-accent-soft font-bold text-accent-text', className)}>
    Now
  </span>
);
