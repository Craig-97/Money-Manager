import { ComponentProps } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '~/lib/cn';
import { bareInputClasses } from '../fieldClasses';

interface SearchInputProps extends Omit<ComponentProps<'input'>, 'type' | 'value'> {
  value: string;
  // Shows a clear button while there's text
  onClear: () => void;
  boxClassName?: string;
}

/* The pill-shaped search box from the notes page */
export const SearchInput = ({
  value,
  onClear,
  boxClassName,
  className,
  ...props
}: SearchInputProps) => (
  <div
    className={cn(
      'flex h-[52px] min-w-0 items-center gap-2.5 rounded-full border border-border bg-surface pr-2 pl-[18px] text-muted transition-[border-color,box-shadow] focus-within:border-accent focus-within:shadow-[0_0_0_3px_var(--accent-soft)]',
      boxClassName
    )}>
    <Search size={18} className="shrink-0" aria-hidden="true" />
    <input
      type="search"
      value={value}
      className={cn(
        bareInputClasses,
        'text-[15px] font-medium [&::-webkit-search-cancel-button]:appearance-none',
        className
      )}
      {...props}
    />
    {value ? (
      <button
        type="button"
        aria-label="Clear search"
        onClick={onClear}
        className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted hover:bg-hover hover:text-text">
        <X size={16} strokeWidth={2.25} aria-hidden="true" />
      </button>
    ) : null}
  </div>
);
