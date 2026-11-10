import { DueInfo } from '~/lib/payments';
import { MovedTag } from '../MovedTag';
import { greenTagClasses, redTagClasses } from '../tagClasses';

/*
 * When it's due: a tag for today, overdue or paid, otherwise the date and how far off it is. A
 * date moved off a weekend or bank holiday says so underneath.
 */
export const DueCell = ({ due }: { due: DueInfo }) => {
  const moved = due.moved ? <MovedTag moved={due.moved} /> : null;
  if (due.state === 'today') {
    const today = <span className={redTagClasses}>Today</span>;
    return moved ? (
      <div className="flex flex-col items-start gap-1">
        {today}
        {moved}
      </div>
    ) : (
      today
    );
  }
  if (due.state === 'overdue' || due.state === 'paid') {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className={due.state === 'paid' ? greenTagClasses : redTagClasses}>
          {due.state === 'paid' ? 'Paid' : 'Overdue'}
        </span>
        <span className="text-xs font-medium text-muted">{due.label}</span>
        {moved}
      </div>
    );
  }
  return (
    <div>
      <p className="text-sm font-semibold">{due.label}</p>
      <p className="mt-0.5 text-xs font-medium text-muted">{due.detail}</p>
      {moved ? <div className="mt-1">{moved}</div> : null}
    </div>
  );
};
