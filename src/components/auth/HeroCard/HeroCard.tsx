import { ReactNode } from 'react';
import { cn } from '~/lib/cn';

interface HeroCardProps {
  // Classes for the content row
  className?: string;
  children: ReactNode;
}

/* The small accent card at the top of the mobile sign in and forgot password screens. Decorative. */
export const HeroCard = ({ className, children }: HeroCardProps) => (
  <div
    aria-hidden="true"
    className="relative overflow-hidden rounded-[28px] bg-hero-bg px-[22px] py-5 text-hero-text md:hidden">
    <div className="absolute -top-[70px] -right-[60px] size-[180px] rounded-full bg-hero-chip" />
    <div className={cn('relative flex gap-3', className)}>{children}</div>
  </div>
);
