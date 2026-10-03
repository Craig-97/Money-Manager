import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';
import { mergeRefs } from '~/lib/react';

const SIZES = {
  // Desktop lists
  sm: 'size-5 rounded-[7px] checked:after:w-[9px]',
  // Mobile lists
  md: 'size-[22px] rounded-lg checked:after:w-2.5'
} as const;

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'size'> {
  size?: keyof typeof SIZES;
  // Some but not all of a group are selected, shown as a dash
  indeterminate?: boolean;
}

/*
 * A native checkbox in the design's style. It has no hit area of its own: wrap it in a 44px
 * label (see CheckboxHitArea) or give it a visible label.
 */
export const Checkbox = ({
  size = 'sm',
  indeterminate = false,
  className,
  ref,
  ...props
}: CheckboxProps) => (
  <input
    type="checkbox"
    ref={mergeRefs(ref, node => {
      if (node) node.indeterminate = indeterminate;
    })}
    className={cn(
      'm-0 inline-grid shrink-0 cursor-pointer appearance-none place-content-center border-[1.5px] border-border-strong bg-surface transition-colors hover:border-muted',
      'disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-border-strong',
      'checked:border-accent checked:bg-accent',
      // The tick: an L of two borders, rotated
      "checked:after:h-[5px] checked:after:-translate-y-px checked:after:-rotate-45 checked:after:border-2 checked:after:border-t-0 checked:after:border-r-0 checked:after:border-on-accent checked:after:content-['']",
      // The dash for a part-selected group
      "indeterminate:border-accent indeterminate:bg-accent indeterminate:after:h-0.5 indeterminate:after:w-2.5 indeterminate:after:translate-y-0 indeterminate:after:rotate-0 indeterminate:after:rounded-sm indeterminate:after:border-0 indeterminate:after:bg-on-accent indeterminate:after:content-['']",
      SIZES[size],
      className
    )}
    {...props}
  />
);

/* A 44px touch target around a checkbox that has no visible label of its own */
export const CheckboxHitArea = ({ className, ...props }: ComponentProps<'label'>) => (
  <label
    className={cn(
      'inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-xl',
      className
    )}
    {...props}
  />
);
