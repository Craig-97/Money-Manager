import { cn } from '~/lib/cn';

// The design's input boxes. md is for forms and dialogs, lg for the sign in and register screens.
const SIZES = {
  md: 'h-12 rounded-2xl px-4',
  lg: 'h-14 rounded-[18px] pr-1.5 pl-[18px]'
} as const;

export type FieldSize = keyof typeof SIZES;

/* Classes for the box around an input. It shows focus and errors for whatever is inside it. */
export const fieldClasses = ({
  size = 'md',
  invalid = false,
  className
}: { size?: FieldSize; invalid?: boolean; className?: string } = {}) =>
  cn(
    'flex w-full items-center gap-1.5 border-[1.5px] border-border-strong bg-surface-2 text-[15px] font-semibold text-text transition-[border-color,box-shadow]',
    'focus-within:border-accent focus-within:shadow-[0_0_0_4px_var(--accent-soft)]',
    'has-disabled:cursor-not-allowed has-disabled:opacity-60',
    // A select or date picker trigger styled as a field shows the focus ring while it's open
    'aria-expanded:border-accent aria-expanded:shadow-[0_0_0_4px_var(--accent-soft)]',
    invalid &&
      'border-expense shadow-[0_0_0_4px_var(--expense-bg)] focus-within:border-expense focus-within:shadow-[0_0_0_4px_var(--expense-bg)]',
    SIZES[size],
    className
  );

/* The input inside a field box: no border or background of its own */
export const bareInputClasses =
  'h-full w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-text outline-none placeholder:text-faint';
