import { Plus } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Debts } from '../../hooks';
import { DebtRow, debtRowClasses } from '../DebtRow';
import { DebtSortMenu } from '../DebtSortMenu';

/* Desktop: every debt, sortable, with what they cost a month and what's left under them */
export const DebtsTable = ({ debts }: { debts: Debts }) => {
  const { sorted, sort, setSort, totals } = debts;
  const openAddDebt = usePaymentDialogStore(s => s.openAddDebt);
  const count = `${sorted.length} ${sorted.length === 1 ? 'debt' : 'debts'}`;

  return (
    <article
      aria-labelledby="debts-title"
      className={cn(
        tileLift,
        'flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5'
      )}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <h2 id="debts-title" className="text-[19px] font-extrabold tracking-[-0.02em]">
          Your debts
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={openAddDebt}
            aria-label="Add a debt"
            className="text-[13px] text-accent-text">
            <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
            Add
          </Button>
          <DebtSortMenu sort={sort} onSort={setSort} />
        </div>
      </div>

      <div role="table" aria-label="Debts">
        <div
          role="row"
          className={cn(
            debtRowClasses,
            'min-h-[52px] text-xs font-bold tracking-[0.04em] text-muted uppercase'
          )}>
          <span role="columnheader">Debt</span>
          <span role="columnheader">APR</span>
          <span role="columnheader" className="hidden wide:block">
            Monthly
          </span>
          <span role="columnheader">Paid off</span>
          <span role="columnheader" className="text-right">
            Left
          </span>
          <span role="columnheader" className="hidden wide:block">
            Cleared
          </span>
          <span />
        </div>
        <div className="flex flex-col gap-0.5 border-t border-border pt-1.5">
          {sorted.map(debt => (
            <DebtRow key={debt.id} debt={debt} debts={debts} />
          ))}
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-border px-4 pt-4 pb-1 pl-5">
          <p className="text-[13px] font-semibold text-muted">
            {count} · {formatMoney(totals.monthly, { whole: true })} a month
          </p>
          <p className="flex items-baseline gap-2.5">
            <span className="text-[13px] font-semibold text-muted">Left to pay</span>
            <span className="num text-xl font-extrabold text-expense">
              {formatMoney(totals.left)}
            </span>
          </p>
        </div>
      </div>
    </article>
  );
};
