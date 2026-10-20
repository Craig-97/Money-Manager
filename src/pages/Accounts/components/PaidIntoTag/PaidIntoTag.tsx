import { cn } from '~/lib/cn';

/* Marks the account pay lands in, once there's more than one to spend from */
export const PaidIntoTag = ({ className }: { className?: string }) => (
  <span
    className={cn(
      'inline-flex h-[22px] items-center self-start rounded-full bg-accent-soft px-2 text-[11px] font-bold whitespace-nowrap text-accent-text',
      className
    )}>
    Where you get paid
  </span>
);
