import { Button } from '~/components/ui/Button';
import { DateBox } from '~/components/ui/DateBox';
import { Skeleton } from '~/components/ui/Skeleton';
import { DebtHistory } from '~/hooks/useDebtHistory';
import { cn } from '~/lib/cn';
import { DebtPayment } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { ShowOlderPayments } from '../ShowOlderPayments';

interface PaymentsListProps {
  debt: DebtPayment;
  history: DebtHistory;
  onUndoOverpayment: (recordId: string, name: string) => void;
}

/*
 * A phone's version of a debt's payments, for the payments sheet: newest first and by month, led by
 * the next one due, each in a row rather than the desktop's columns
 */
export const PaymentsList = ({ debt, history, onUndoOverpayment }: PaymentsListProps) => {
  if (history.loading) {
    return (
      <div aria-busy="true" className="flex flex-col gap-0.5">
        {[0, 1, 2].map(row => (
          <div key={row} className="flex min-h-[68px] items-center gap-3">
            <Skeleton className="h-[46px] w-[52px] rounded-[14px]" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-4 w-[45%]" />
              <Skeleton className="h-3 w-[60%]" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (history.error) {
    return (
      <div className="flex flex-col items-center gap-3 px-3 py-6 text-center">
        <p className="text-sm font-semibold">Couldn’t load the payments</p>
        <Button onClick={history.retry}>Try again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {history.months.map(month => (
        <section key={month.label} aria-label={month.label}>
          <h3 className="pt-2.5 pb-1 text-xs font-bold tracking-[0.06em] text-muted uppercase">
            {month.label}
          </h3>
          <ul className="flex flex-col gap-0.5">
            {month.entries.map(entry => (
              <li key={entry.id} className="flex min-h-[68px] items-center gap-3 py-2">
                <DateBox date={entry.date} top="weekday" accent={entry.kind === 'due'} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-bold">
                    {entry.kind === 'due' ? entry.detail : entry.label}
                  </span>
                  {entry.kind === 'due' ? null : (
                    <span className="text-xs font-medium text-muted">{entry.detail}</span>
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
        </section>
      ))}
      {history.hasMore ? (
        <ShowOlderPayments onClick={history.showMore} loading={history.loadingMore} />
      ) : null}
    </div>
  );
};
