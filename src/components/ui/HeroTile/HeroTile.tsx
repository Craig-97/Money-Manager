import { HTMLAttributes } from 'react';
import { cn } from '~/lib/cn';

const SIZES = {
  // A page's hero on desktop, lifting on hover like the other tiles
  lg: {
    tile: 'min-w-0 gap-6 p-7 transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_var(--shadow)]',
    circle: '-top-[110px] -right-[90px] size-[300px]'
  },
  // A page's hero on a phone
  md: { tile: 'gap-4 p-[22px]', circle: '-top-[110px] -right-[90px] size-[220px]' },
  // A summary card
  sm: { tile: 'gap-4 p-5', circle: '-top-[70px] -right-[60px] size-[180px]' }
} as const;

interface HeroTileProps extends HTMLAttributes<HTMLElement> {
  size?: keyof typeof SIZES;
  as?: 'article' | 'section' | 'div';
}

/* The dark card a page leads with, with the light circle in its corner */
export const HeroTile = ({
  size = 'lg',
  as: Tag = 'article',
  className,
  children,
  ...props
}: HeroTileProps) => (
  <Tag
    {...props}
    className={cn(
      'relative flex flex-col overflow-hidden rounded-3xl bg-hero-bg text-hero-text',
      SIZES[size].tile,
      className
    )}>
    <div
      aria-hidden="true"
      className={cn('pointer-events-none absolute rounded-full bg-hero-chip', SIZES[size].circle)}
    />
    {children}
  </Tag>
);
