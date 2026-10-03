import { cn } from '~/lib/cn';

// From the design's .btn classes
const VARIANTS = {
  default: 'border-border bg-surface text-text hover:border-border-strong hover:bg-hover',
  accent: 'border-transparent bg-accent text-on-accent hover:brightness-110',
  solid: 'border-transparent bg-pill-active-bg text-pill-active-text hover:brightness-[.92]',
  danger: 'border-transparent bg-expense-bg text-expense hover:border-expense',
  ghost: 'border-transparent bg-transparent text-muted hover:bg-hover hover:text-text'
} as const;

const SIZES = {
  md: 'h-11 px-[18px] text-sm',
  lg: 'h-12 px-5 text-sm',
  xl: 'h-[54px] px-[22px] text-[15px] font-bold'
} as const;

export type ButtonVariant = keyof typeof VARIANTS;
export type ButtonSize = keyof typeof SIZES;

/* Button classes, also used to style links as buttons */
export const buttonVariants = ({
  variant = 'default',
  size = 'md',
  className
}: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) =>
  cn(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border leading-none font-semibold whitespace-nowrap no-underline transition-[background-color,border-color,color,filter] disabled:cursor-not-allowed disabled:opacity-60',
    VARIANTS[variant],
    SIZES[size],
    className
  );
