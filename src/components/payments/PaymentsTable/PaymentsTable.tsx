import { cn } from '~/lib/cn';
import { formatShortDay } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { HistoryEntry } from '~/lib/payments';
import {
  DateBox,
  historyHeadClasses,
  historyMonthClasses,
  historyNoteClasses,
  historyRowClasses,
  Skeleton
} from '../../ui';
import { accentTagClasses, greenTagClasses, tagClasses } from '../PaymentParts';
import { PaymentsDialogModel } from '../PaymentsDialog/usePaymentsDialog';

interface PaymentsTableProps {
  dialog: PaymentsDialogModel;
}

const TAGS: Record<HistoryEntry['kind'], string> = {
  due: accentTagClasses,
  paid: tagClasses,
  skipped: tagClasses,
  overpayment: greenTagClasses,
  balance: tagClasses
};

// A debt has the balance after each; any other payment, the account it used once there are several
const COLUMNS = {
  debt: 'grid-cols-[64px_minmax(0,1fr)_100px_110px]',
  from: 'grid-cols-[64px_minmax(0,1fr)_120px_100px]',
  plain: 'grid-cols-[64px_minmax(0,1fr)_100px]'
};

/* A year of a payment's history on desktop, by month, in columns */
export const PaymentsTable = ({ dialog }: PaymentsTableProps) => {
  const { debt, several, history } = dialog;
  const columns = cn(
    'grid items-center gap-x-3',
    COLUMNS[debt ? 'debt' : several ? 'from' : 'plain']
  );
  const from = !debt && several;

  return (
    <div role="table" aria-label={`Payments in ${history.year}`} className="flex flex-col">
      <div role="row" className={cn(columns, historyHeadClasses)}>
        <span role="columnheader">Date</span>
        <span role="columnheader">What</span>
        {from ? <span role="columnheader">From</span> : null}
        <span role="columnheader" className="text-right">
          Amount
        </span>
        {debt ? (
          <span role="columnheader" className="text-right">
            Balance after
          </span>
        ) : null}
      </div>
      {history.loading
        ? [0, 1, 2].map(row => (
            <div key={row} className={cn(columns, 'min-h-16 px-2')}>
              <Skeleton className="h-[46px] w-[52px] rounded-[14px]" />
              <Skeleton className="h-6 w-20 rounded-full" />
              {from ? <Skeleton className="h-4 w-16" /> : null}
              <Skeleton className="ml-auto h-4 w-16" />
              {debt ? <Skeleton className="ml-auto h-4 w-16" /> : null}
            </div>
          ))
        : dialog.months.map(month => (
            <div key={month.label} role="rowgroup" aria-label={month.label} className="pt-1.5">
              <p aria-hidden="true" className={historyMonthClasses}>
                {month.label}
              </p>
              <div className="flex flex-col gap-0.5">
                {month.entries.map(entry => (
                  <div key={entry.id} role="row" className={cn(columns, historyRowClasses)}>
                    <span role="cell">
                      <DateBox date={entry.date} top="weekday" accent={entry.kind === 'due'} />
                      <span className="sr-only">{formatShortDay(entry.date)}</span>
                    </span>
                    <span role="cell" className="flex min-w-0 items-center gap-2 whitespace-nowrap">
                      <span className={TAGS[entry.kind]}>{entry.label}</span>
                      {entry.note ? <span className={historyNoteClasses}>{entry.note}</span> : null}
                      {entry.undoable ? (
                        <button
                          type="button"
                          onClick={() => dialog.undoOverpayment(entry.id)}
                          className="cursor-pointer rounded-full px-2 py-1 text-xs font-bold text-accent-text hover:bg-hover">
                          Undo
                        </button>
                      ) : null}
                    </span>
                    {from ? (
                      <span role="cell" className="truncate text-sm font-semibold text-muted">
                        {entry.account ?? '—'}
                      </span>
                    ) : null}
                    <span
                      role="cell"
                      className={cn(
                        'text-right num text-sm font-extrabold',
                        dialog.isGreen(entry) && 'text-income'
                      )}>
                      {entry.amount === null ? '—' : formatMoney(entry.amount)}
                    </span>
                    {debt ? (
                      <span role="cell" className="text-right num text-sm font-bold text-muted">
                        {entry.balanceAfter === null
                          ? '—'
                          : `${entry.kind === 'due' ? '≈ ' : ''}${formatMoney(entry.balanceAfter, { whole: true })}`}
                      </span>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
    </div>
  );
};
