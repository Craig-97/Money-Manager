import { cn } from '~/lib/cn';

const SIZES = {
  sm: 'size-[38px] text-xs',
  md: 'size-11 text-[13px]'
} as const;

interface AvatarProps {
  initials: string;
  size?: keyof typeof SIZES;
  className?: string;
}

/* Initials in an accent circle. Decorative: the link or button around it carries the name. */
export const Avatar = ({ initials, size = 'md', className }: AvatarProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-bold text-accent-text',
      SIZES[size],
      className
    )}>
    {initials}
  </span>
);
