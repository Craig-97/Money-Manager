import { cn } from '~/lib/cn';
import { formatShortDay } from '~/lib/dates';
import {
  DateBox,
  historyHeadClasses,
  historyMonthClasses,
  historyNoteClasses,
  historyRowClasses,
  Skeleton
} from '../../ui';
import { balanceAfterText, CHANGE_TAGS, changeColour, changeText } from '../balanceChangeParts';
import { BalanceChangesDialogModel } from '../BalanceChangesDialog/useBalanceChangesDialog';

interface BalanceChangesTableProps {
  dialog: BalanceChangesDialogModel;
}

const columns = 'grid grid-cols-[64px_minmax(0,1fr)_110px_120px] items-center gap-x-3';

/* A year of an account's balance changes on desktop, by month, in columns */
export const BalanceChangesTable = ({ dialog }: BalanceChangesTableProps) => (
  <div
    role="table"
    aria-label={`Balance changes in ${dialog.history.year}`}
    className="flex flex-col">
    <div role="row" className={cn(columns, historyHeadClasses)}>
      <span role="columnheader">Date</span>
      <span role="columnheader">What</span>
      <span role="columnheader" className="text-right">
        Change
      </span>
      <span role="columnheader" className="text-right">
        Balance after
      </span>
    </div>
    {dialog.history.loading
      ? [0, 1, 2].map(row => (
          <div key={row} className={cn(columns, 'min-h-16 px-2')}>
            <Skeleton className="h-[46px] w-[52px] rounded-[14px]" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="ml-auto h-4 w-16" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))
      : dialog.months.map(month => (
          <div key={month.label} role="rowgroup" aria-label={month.label} className="pt-1.5">
            <p aria-hidden="true" className={historyMonthClasses}>
              {month.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {month.entries.map(change => (
                <div key={change.id} role="row" className={cn(columns, historyRowClasses)}>
                  <span role="cell">
                    <DateBox date={change.date} top="weekday" accent={change.kind === 'DUE'} />
                    <span className="sr-only">{formatShortDay(change.date)}</span>
                  </span>
                  <span role="cell" className="flex min-w-0 items-center gap-2 whitespace-nowrap">
                    <span className={CHANGE_TAGS[change.tone]}>{change.label}</span>
                    {change.note ? (
                      <span className={cn(historyNoteClasses, 'truncate')}>{change.note}</span>
                    ) : null}
                  </span>
                  <span
                    role="cell"
                    className={cn('text-right num text-sm font-extrabold', changeColour(change))}>
                    {changeText(change)}
                  </span>
                  <span role="cell" className="text-right num text-sm font-bold text-muted">
                    {balanceAfterText(change)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
  </div>
);
