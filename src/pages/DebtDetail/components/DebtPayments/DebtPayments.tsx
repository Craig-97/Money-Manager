import { ArrowUp } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { Skeleton } from '~/components/ui/Skeleton';
import { useDebtHistory } from '~/hooks/useDebtHistory';
import { cn } from '~/lib/cn';
import { formatShortMonth } from '~/lib/dates';
import { DebtPayment } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { useDebtDialogStore } from '~/state/debtDialog';

interface DebtPaymentsProps {
  debt: DebtPayment;
  today: Date;
  onUndoOverpayment: (recordId: string, name: string) => void;
}

/* The debt's payments, newest first, led by the next one due */
export const DebtPayments = ({ debt, today, onUndoOverpayment }: DebtPaymentsProps) => {
  const openOverpayment = useDebtDialogStore(s => s.openOverpayment);
  const { entries, loading, error, retry } = useDebtHistory(debt, today);

  return (
    <section aria-label="Payments" className="flex flex-col gap-3.5">
      <div className="flex flex-col gap-0.5 rounded-3xl border border-border bg-surface p-2">
        {loading ? (
          [0, 1, 2].map(row => (
            <div key={row} className="flex min-h-[68px] items-center gap-3 px-2.5">
              <Skeleton className="size-12 rounded-[14px]" />
              <div className="flex flex-1 flex-col gap-1.5">
                <Skeleton className="h-4 w-[45%]" />
                <Skeleton className="h-3 w-[60%]" />
              </div>
            </div>
          ))
        ) : error ? (
          <div className="flex flex-col items-center gap-3 px-3 py-6 text-center">
            <p className="text-sm font-semibold">Couldn’t load the payments</p>
            <Button onClick={retry}>Try again</Button>
          </div>
        ) : (
          <ul className="flex flex-col gap-0.5">
            {entries.map(entry => (
              <li key={entry.id} className="flex min-h-[68px] items-center gap-3 px-2.5 py-2">
                <span
                  className={cn(
                    'flex size-12 shrink-0 flex-col items-center justify-center rounded-[14px] border leading-none',
                    entry.kind === 'due'
                      ? 'border-transparent bg-accent-soft text-accent-text'
                      : 'border-border bg-surface-2'
                  )}>
                  <span className="text-[10px] font-bold uppercase">
                    {formatShortMonth(entry.date)}
                  </span>
                  <span className="num text-lg font-extrabold">{entry.date.getDate()}</span>
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-bold">
                    {entry.kind === 'due' ? entry.detail : entry.label}
                  </span>
                  {entry.kind === 'due' ? null : (
                    <span className="truncate text-xs font-medium text-muted">{entry.detail}</span>
                  )}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <span
                    className={cn(
                      'num text-[15px] font-extrabold',
                      entry.kind === 'overpayment' && 'text-income'
                    )}>
                    {entry.amount === null ? '—' : formatMoney(entry.amount)}
                  </span>
                  {entry.undoable ? (
                    <button
                      type="button"
                      onClick={() => onUndoOverpayment(entry.id, debt.name)}
                      className="-mr-2 cursor-pointer rounded-full px-2 py-1 text-xs font-bold text-accent-text hover:bg-hover">
                      Undo
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button onClick={() => openOverpayment(debt.id)} className="h-[52px] w-full">
        <ArrowUp size={16} aria-hidden="true" />
        Log an overpayment
      </Button>
    </section>
  );
};
