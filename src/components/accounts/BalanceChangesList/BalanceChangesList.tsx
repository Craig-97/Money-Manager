import { cn } from '~/lib/cn';
import {
  DateBox,
  historyListMonthClasses,
  historyListRowClasses,
  ShowOlder,
  Skeleton
} from '../../ui';
import { balanceAfterText, changeColour, changeText } from '../balanceChangeParts';
import { BalanceChangesDialogModel } from '../BalanceChangesDialog/useBalanceChangesDialog';

interface BalanceChangesListProps {
  dialog: BalanceChangesDialogModel;
}

/*
 * A phone's version of an account's balance changes: newest first and by month, each in a row with
 * what it was and the balance after under it. Older years add below.
 */
export const BalanceChangesList = ({ dialog }: BalanceChangesListProps) => {
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
            {month.entries.map(change => (
              <li key={change.id} className={historyListRowClasses}>
                <DateBox date={change.date} top="weekday" accent={change.kind === 'DUE'} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-[15px] font-bold">{change.label}</span>
                  <span className="text-xs font-medium text-muted">
                    {[change.note, `${balanceAfterText(change)} after`].filter(Boolean).join(' · ')}
                  </span>
                </span>
                <span
                  className={cn('shrink-0 num text-[15px] font-extrabold', changeColour(change))}>
                  {changeText(change)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {history.hasOlder ? (
        <ShowOlder
          label="Show older changes"
          onClick={() => void history.showOlder()}
          loading={history.loadingMore}
        />
      ) : null}
    </div>
  );
};
