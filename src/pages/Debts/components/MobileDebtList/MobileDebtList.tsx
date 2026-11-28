import { ListFilter } from 'lucide-react';
import { DEBT_SORTS, sortLabelOf } from '../../debtsModel';
import { Debts } from '../../hooks';
import { MobileDebtRow } from '../MobileDebtRow';

/* Mobile: the debts as a list, each opening its own page. The sort button steps through the orders. */
export const MobileDebtList = ({ debts }: { debts: Debts }) => {
  const { sorted, sort, setSort, base, today } = debts;
  const nextSort =
    DEBT_SORTS[(DEBT_SORTS.findIndex(s => s.value === sort) + 1) % DEBT_SORTS.length];

  return (
    <section aria-labelledby="debts-title" className="flex flex-col gap-2">
      <div className="flex min-h-11 items-center justify-between gap-2 px-1">
        <h2 id="debts-title" className="text-xs font-bold tracking-[0.06em] text-muted uppercase">
          Your debts · {sorted.length}
        </h2>
        <button
          type="button"
          onClick={() => setSort(nextSort.value)}
          aria-label={`Sorted by ${sortLabelOf(sort).toLowerCase()}. Sort by ${nextSort.label.toLowerCase()}`}
          className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-bold text-text hover:bg-hover">
          <ListFilter size={15} aria-hidden="true" />
          {sortLabelOf(sort)}
        </button>
      </div>
      <div className="flex flex-col gap-0.5 rounded-3xl border border-border bg-surface p-2">
        {sorted.map(debt => (
          <MobileDebtRow
            key={debt.id}
            debt={debt}
            clearedIn={base.clearedIn[debt.id]}
            today={today}
          />
        ))}
      </div>
    </section>
  );
};
