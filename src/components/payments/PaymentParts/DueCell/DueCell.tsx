import { DueInfo } from '~/lib/payments';
import { redTagClasses } from '../tagClasses';

/* When it's due: a tag for today or overdue, otherwise the date and how far off it is */
export const DueCell = ({ due }: { due: DueInfo }) => {
  if (due.state === 'today') return <span className={redTagClasses}>Today</span>;
  if (due.state === 'overdue') {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className={redTagClasses}>Overdue</span>
        <span className="text-xs font-medium text-muted">{due.label}</span>
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm font-semibold">{due.label}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{due.detail}</p>
    </div>
  );
};
