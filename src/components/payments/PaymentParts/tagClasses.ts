import { cn } from '~/lib/cn';

/* The pill tags rows use, in their tones */

export const tagClasses =
  'inline-flex h-7 items-center gap-1.5 rounded-full border border-border bg-surface-2 px-2.5 text-xs font-bold whitespace-nowrap text-muted';

export const redTagClasses = cn(tagClasses, 'border-transparent bg-expense-bg text-expense');
export const greenTagClasses = cn(tagClasses, 'border-transparent bg-income-bg text-income');
export const accentTagClasses = cn(
  tagClasses,
  'border-transparent bg-accent-soft text-accent-text'
);
