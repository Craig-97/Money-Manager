import { ReactNode } from 'react';
import { cn } from '~/lib/cn';
import { HeroTile } from '../../ui';

interface HeroCardProps {
  // Classes for the content row
  className?: string;
  children: ReactNode;
}

/* The small accent card at the top of the mobile sign in and forgot password screens. Decorative. */
export const HeroCard = ({ className, children }: HeroCardProps) => (
  <HeroTile
    as="div"
    aria-hidden="true"
    size="sm"
    className="block rounded-[28px] px-[22px] py-5 md:hidden">
    <div className={cn('relative flex gap-3', className)}>{children}</div>
  </HeroTile>
);
