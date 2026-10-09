import { SearchInput } from '~/components/form/SearchInput';
import { Select } from '~/components/form/Select';
import { categoryLabel } from '~/lib/payments';
import { Recurring } from '../../hooks';
import { ALL_CATEGORIES } from '../../recurringModel';

/* Desktop: search by name or category, and narrow to one category */
export const PaymentFilters = ({ recurring }: { recurring: Recurring }) => {
  const { query, setQuery, category, setCategory, categories } = recurring;
  const options = [
    { value: ALL_CATEGORIES, label: 'All categories' },
    ...categories.map(value => ({ value, label: categoryLabel(value) }))
  ];

  return (
    <div className="flex flex-wrap items-center gap-2.5 px-1">
      <SearchInput
        aria-label="Search payments"
        placeholder="Search by name or category"
        value={query}
        onChange={event => setQuery(event.target.value)}
        onClear={() => setQuery('')}
        boxClassName="h-12 min-w-[220px] flex-[1_1_260px]"
      />
      <Select
        aria-label="Category"
        variant="pill"
        value={category}
        onValueChange={setCategory}
        options={options}
        className="h-12 min-w-[200px]"
      />
    </div>
  );
};
