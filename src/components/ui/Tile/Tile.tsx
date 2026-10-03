import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';

interface TileProps extends ComponentProps<'section'> {
  // No lift on hover, for tiles that aren't interactive as a whole
  flat?: boolean;
}

/* The design's rounded card. It lifts slightly on hover, on devices that can hover. */
export const Tile = ({ flat = false, className, ...props }: TileProps) => (
  <section
    className={cn(
      'flex min-w-0 flex-col gap-2.5 rounded-3xl border border-border bg-surface p-5 md:gap-3 md:p-6',
      !flat &&
        'transition-[translate,box-shadow,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_22px_44px_-28px_var(--shadow)]',
      className
    )}
    {...props}
  />
);
