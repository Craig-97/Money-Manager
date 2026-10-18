import { ComponentProps } from 'react';
import { cn } from '~/lib/cn';

interface SwitchProps extends Omit<ComponentProps<'button'>, 'onChange' | 'role'> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

/* An on/off switch. Label it with aria-label or aria-labelledby. */
export const Switch = ({ checked, onCheckedChange, className, ...props }: SwitchProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onCheckedChange(!checked)}
    className={cn(
      'group relative h-[26px] w-11 shrink-0 cursor-pointer rounded-full border-0 bg-track p-0 transition-colors duration-150 aria-checked:bg-accent',
      className
    )}
    {...props}>
    <span
      aria-hidden="true"
      className="absolute top-[3px] left-[3px] size-5 rounded-full bg-muted transition-[left,background-color] duration-150 group-aria-checked:left-[21px] group-aria-checked:bg-on-accent"
    />
  </button>
);
