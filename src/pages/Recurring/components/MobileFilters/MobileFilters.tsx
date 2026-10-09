import { SearchInput } from '~/components/form/SearchInput';
import { cn } from '~/lib/cn';
import { categoryLabel } from '~/lib/payments';
import { Recurring } from '../../hooks';
import { ALL_CATEGORIES } from '../../recurringModel';

/* Mobile: the search box, then the categories as a row of chips that scrolls sideways */
export const MobileFilters = ({ recurring }: { recurring: Recurring }) => {
  const { query, setQuery, category, setCategory, categories } = recurring;
  const chips = [
    { value: ALL_CATEGORIES, label: 'All' },
    ...categories.map(value => ({ value, label: categoryLabel(value) }))
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <SearchInput
        aria-label="Search payments"
        placeholder="Search payments"
        value={query}
        onChange={event => setQuery(event.target.value)}
        onClear={() => setQuery('')}
      />
      <div
        role="group"
        aria-label="Category"
        className="-mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto px-4 [&::-webkit-scrollbar]:hidden">
        {chips.map(chip => (
          <button
            key={chip.value}
            type="button"
            aria-pressed={chip.value === category}
            onClick={() => setCategory(chip.value)}
            className={cn(
              'h-10 shrink-0 cursor-pointer rounded-full border border-border bg-surface px-3.5 text-[13px] font-semibold whitespace-nowrap text-muted',
              'aria-pressed:border-transparent aria-pressed:bg-pill-active-bg aria-pressed:text-pill-active-text'
            )}>
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
