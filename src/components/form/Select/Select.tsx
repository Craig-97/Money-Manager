import { Check, ChevronDown } from 'lucide-react';
import * as SelectPrimitive from '@radix-ui/react-select';
import { optionClasses, popoverClasses } from '~/components/ui/popoverClasses';
import { cn } from '~/lib/cn';
import { fieldClasses } from '../fieldClasses';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  value: T | undefined;
  onValueChange: (value: T) => void;
  options: SelectOption<T>[];
  placeholder?: string;
  // field sits in forms like an input; pill is the small rounded picker used in toolbars
  variant?: 'field' | 'pill';
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

const TRIGGERS = {
  field: 'justify-between gap-2 text-left',
  pill: 'h-11 min-w-[76px] justify-between gap-2.5 rounded-full border border-border-strong bg-surface pr-3.5 pl-4 text-[13px] font-semibold text-text hover:bg-hover aria-expanded:bg-hover'
} as const;

export const Select = <T extends string>({
  value,
  onValueChange,
  options,
  placeholder = 'Choose…',
  variant = 'field',
  invalid = false,
  disabled,
  id,
  name,
  className,
  ...aria
}: SelectProps<T>) => (
  <SelectPrimitive.Root
    value={value}
    onValueChange={next => onValueChange(next as T)}
    disabled={disabled}
    name={name}>
    <SelectPrimitive.Trigger
      id={id}
      aria-invalid={invalid || undefined}
      className={cn(
        'group cursor-pointer outline-none disabled:cursor-not-allowed disabled:opacity-60 data-placeholder:text-muted',
        variant === 'field' ? fieldClasses({ invalid }) : 'inline-flex items-center',
        TRIGGERS[variant],
        className
      )}
      {...aria}>
      <span className="min-w-0 truncate">
        <SelectPrimitive.Value placeholder={placeholder} />
      </span>
      <SelectPrimitive.Icon asChild>
        <ChevronDown
          size={17}
          aria-hidden="true"
          className="shrink-0 text-muted transition-transform group-aria-expanded:rotate-180"
        />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>

    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        position="popper"
        sideOffset={8}
        collisionPadding={8}
        className={cn(
          popoverClasses,
          'max-h-[min(280px,var(--radix-select-content-available-height))] min-w-(--radix-select-trigger-width) overflow-hidden'
        )}>
        <SelectPrimitive.Viewport className="flex flex-col gap-0.5 p-1.5">
          {options.map(option => (
            <SelectPrimitive.Item
              key={option.value}
              value={option.value}
              className={cn(
                optionClasses,
                'justify-between py-2.5 leading-[1.3] data-[state=checked]:bg-accent-soft data-[state=checked]:font-bold'
              )}>
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              <SelectPrimitive.ItemIndicator>
                <Check
                  size={16}
                  strokeWidth={2.5}
                  className="text-accent-text"
                  aria-hidden="true"
                />
              </SelectPrimitive.ItemIndicator>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
);
