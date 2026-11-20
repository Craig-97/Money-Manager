import { cn } from '~/lib/cn';
import { formatMoney } from '~/lib/format';
import {
  DateBox,
  historyListMonthClasses,
  historyListRowClasses,
  ShowOlder,
  Skeleton
} from '../../ui';
import { PaymentsDialogModel } from '../PaymentsDialog/usePaymentsDialog';

interface PaymentsListProps {
  dialog: PaymentsDialogModel;
}

/*
 * A phone's version of a payment's history, for the payments sheet: newest first and by month, led
 * by the next one due, each in a row rather than the desktop's columns. Older years add below.
 */
export const PaymentsList = ({ dialog }: PaymentsListProps) => {
  const { history } = dialog;
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

  return (
    <div className="flex flex-col">
      {dialog.allMonths.map(month => (
        <section key={month.label} aria-label={month.label}>
          <h3 className={historyListMonthClasses}>{month.label}</h3>
          <ul className="flex flex-col gap-0.5">
            {month.entries.map(entry => (
              <li key={entry.id} className={historyListRowClasses}>
                <DateBox date={entry.date} top="weekday" accent={entry.kind === 'due'} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-bold">
                    {entry.kind === 'due' ? entry.detail : entry.label}
                  </span>
                  {entry.kind === 'due' || !entry.detail ? null : (
                    <span className="text-xs font-medium text-muted">{entry.detail}</span>
                  )}
                </span>
                <span className="flex shrink-0 flex-col items-end gap-0.5">
                  <span
                    className={cn(
                      'num text-[15px] font-extrabold',
                      dialog.isGreen(entry) && 'text-income'
                    )}>
                    {entry.amount === null ? '—' : formatMoney(entry.amount)}
                  </span>
                  {entry.undoable ? (
                    <button
                      type="button"
                      onClick={() => dialog.undoOverpayment(entry.id)}
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
      {history.hasOlder ? (
        <ShowOlder
          label="Show older payments"
          onClick={() => void history.showOlder()}
          loading={history.loadingMore}
        />
      ) : null}
    </div>
  );
};
