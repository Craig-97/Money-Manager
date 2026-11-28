import { cn } from '~/lib/cn';

/* A thin bar showing how much of a debt is paid off, 0 to 1 */
export const DebtProgress = ({ share, className }: { share: number; className?: string }) => (
  <span
    aria-hidden="true"
    className={cn('block h-1.5 overflow-hidden rounded-full bg-track', className)}>
    <span
      className="block h-full rounded-full bg-accent"
      style={{ width: `${Math.round(Math.min(Math.max(share, 0), 1) * 100)}%` }}
    />
  </span>
);
