import * as ToggleGroup from '@radix-ui/react-toggle-group';
import { cn } from '~/lib/cn';

export interface ChipOption<T extends string = string> {
  value: T;
  label: string;
}

// Named by a label of its own, or by a heading or label already on the page
type Labelled = { 'aria-label': string } | { 'aria-labelledby': string };

type ChipGroupProps<T extends string> = Labelled & {
  options: ChipOption<T>[];
  className?: string;
  // Spread the chips evenly over this many columns, rather than letting them wrap
  columns?: number;
} & (
    | { type: 'single'; value: T; onValueChange: (value: T) => void }
    | { type: 'multiple'; value: T[]; onValueChange: (value: T[]) => void }
  );

const chipClasses =
  'inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-border bg-surface-2 px-4 text-[13px] leading-none font-semibold whitespace-nowrap text-text transition-colors hover:border-border-strong data-[state=on]:border-accent data-[state=on]:bg-accent-soft';

/*
 * The design's choice chips: one of several (like a segmented control that wraps), or any number
 * of them. Arrow keys move between them.
 */
export const ChipGroup = <T extends string>(props: ChipGroupProps<T>) => {
  const { options, className, columns, ...rest } = props;
  const grid = columns
    ? {
        className: 'grid gap-2',
        style: { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }
      }
    : { className: 'flex flex-wrap gap-2', style: undefined };
  const items = options.map(option => (
    <ToggleGroup.Item key={option.value} value={option.value} className={chipClasses}>
      {option.label}
    </ToggleGroup.Item>
  ));

  if (rest.type === 'single') {
    const { value, onValueChange, type, ...aria } = rest;
    return (
      <ToggleGroup.Root
        type={type}
        value={value}
        // Clicking the chosen chip would clear it; one is always chosen
        onValueChange={next => next && onValueChange(next as T)}
        className={cn(grid.className, className)}
        style={grid.style}
        {...aria}>
        {items}
      </ToggleGroup.Root>
    );
  }
  const { value, onValueChange, type, ...aria } = rest;
  return (
    <ToggleGroup.Root
      type={type}
      value={value}
      onValueChange={next => onValueChange(next as T[])}
      className={cn(grid.className, className)}
      style={grid.style}
      {...aria}>
      {items}
    </ToggleGroup.Root>
  );
};
