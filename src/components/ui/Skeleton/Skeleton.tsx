import { cn } from '~/lib/cn';

interface SkeletonProps {
  // Size it with width and height classes
  className?: string;
  shape?: 'rect' | 'pill';
  // On the accent "hero" tile the placeholder is a translucent white
  tone?: 'default' | 'hero';
}

/* A placeholder block with a shimmer, shown while content loads. Decorative. */
export const Skeleton = ({ className, shape = 'rect', tone = 'default' }: SkeletonProps) => (
  <span
    aria-hidden="true"
    className={cn(
      'relative block shrink-0 overflow-hidden',
      "after:absolute after:inset-0 after:animate-shimmer after:content-[''] motion-reduce:after:hidden",
      tone === 'default'
        ? 'bg-track after:bg-linear-to-r after:from-transparent after:via-surface/60 after:to-transparent'
        : 'bg-hero-chip after:bg-linear-to-r after:from-transparent after:via-white/16 after:to-transparent',
      shape === 'pill' ? 'rounded-full' : 'rounded-lg',
      className
    )}
  />
);
