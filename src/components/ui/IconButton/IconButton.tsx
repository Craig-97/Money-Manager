import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';

// From the design's .iconbtn and .ghostbtn classes
const VARIANTS = {
  outline:
    'border border-border bg-surface hover:border-border-strong hover:bg-hover hover:text-text',
  ghost: 'border-0 bg-transparent hover:bg-hover hover:text-text'
} as const;

interface IconButtonProps extends ComponentProps<'button'> {
  // Icon-only buttons need a name for screen readers
  'aria-label': string;
  variant?: keyof typeof VARIANTS;
}

/* A 44px round button holding just an icon */
export const IconButton = ({
  variant = 'ghost',
  className,
  type = 'button',
  ...props
}: IconButtonProps) => (
  <button
    type={type}
    className={cn(
      'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full p-0 text-muted transition-colors',
      VARIANTS[variant],
      className
    )}
    {...props}
  />
);
