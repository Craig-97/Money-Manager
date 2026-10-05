import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';

interface TileProps extends ComponentProps<'section'> {
  // No lift on hover, for tiles that aren't interactive as a whole
  flat?: boolean;
}

/*
 * The design's hover lift, for cards that aren't built from Tile itself. Only on devices that
 * hover. A menu or dropdown opened from inside the card renders outside it, so the pointer leaves
 * the card; the card stays lifted for as long as something in it is open.
 *
 * When one closes, the browser keeps the page unhoverable (Radix sets pointer-events on <body>)
 * until its exit animation ends, so the card would dip and rise again. While that style is on
 * <body>, dropping back waits 200ms; the rest of the time the card moves with no delay.
 */
export const tileLift = [
  'transition-[translate,box-shadow,border-color] duration-200 ease-out',
  "[body[style*='pointer-events']_&]:delay-200",
  'hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[0_22px_44px_-28px_var(--shadow)]',
  '[@media(hover:hover)]:has-aria-expanded:-translate-y-0.5 [@media(hover:hover)]:has-aria-expanded:border-border-strong [@media(hover:hover)]:has-aria-expanded:shadow-[0_22px_44px_-28px_var(--shadow)]'
].join(' ');

/* The design's rounded card. It lifts slightly on hover, on devices that can hover. */
export const Tile = ({ flat = false, className, ...props }: TileProps) => (
  <section
    className={cn(
      'flex min-w-0 flex-col gap-2.5 rounded-3xl border border-border bg-surface p-5 md:gap-3 md:p-6',
      !flat && tileLift,
      className
    )}
    {...props}
  />
);
