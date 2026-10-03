import { ReactNode } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from '~/lib/cn';

export interface SegmentedOption<T extends string = string> {
  value: T;
  label: string;
  icon?: ReactNode;
  // A small count badge after the label, e.g. how many payments are in a tab
  count?: number;
}

// sm: the dashboard's list tabs; md: the theme switch; lg: forecast and profile controls
const SIZES = {
  sm: 'h-[38px] gap-2 pr-3.5 pl-4 font-semibold',
  md: 'h-10 gap-1.5 px-3 font-semibold',
  lg: 'h-11 gap-1.5 px-[18px] font-bold'
} as const;

interface SegmentedControlProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: SegmentedOption<T>[];
  'aria-label': string;
  size?: keyof typeof SIZES;
  // Stretch to fill the width, with equal segments
  fullWidth?: boolean;
  className?: string;
}

/* Pick one of a few options. Arrow keys move between them. */
export const SegmentedControl = <T extends string>({
  value,
  onValueChange,
  options,
  size = 'sm',
  fullWidth = false,
  className,
  ...aria
}: SegmentedControlProps<T>) => (
  <ToggleGroup.Root
    type="single"
    value={value}
    // Clicking the selected segment would clear it; a segmented control always has one picked
    onValueChange={next => next && onValueChange(next as T)}
    className={cn(
      'gap-0.5 rounded-full border border-border bg-surface-2 p-1',
      fullWidth ? 'flex' : 'inline-flex',
      className
    )}
    {...aria}>
    {options.map(option => (
      <ToggleGroup.Item
        key={option.value}
        value={option.value}
        className={cn(
          'group inline-flex cursor-pointer items-center justify-center rounded-full text-[13px] leading-none whitespace-nowrap text-muted transition-colors hover:text-text',
          'data-[state=on]:bg-pill-active-bg data-[state=on]:text-pill-active-text',
          SIZES[size],
          fullWidth && 'flex-1'
        )}>
        {option.icon}
        {option.label}
        {option.count === undefined ? null : (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-track px-1.5 text-[11px] font-bold text-muted group-data-[state=on]:bg-accent group-data-[state=on]:text-on-accent">
            {option.count}
          </span>
        )}
      </ToggleGroup.Item>
    ))}
  </ToggleGroup.Root>
);
