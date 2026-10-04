import { PenLine, Plus } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';
import { formatBalance, formatMoney } from '~/lib/format';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { paidText } from '../dashboardModel';
import { Dashboard } from '../hooks';
import { IncomeEditor } from './IncomeEditor';
import { OverdrawnPill } from './NextPaydayTile';

const statClasses = 'flex min-w-0 flex-col gap-2.5 px-7 py-[26px]';
const labelClasses = 'flex min-h-5 items-center gap-2 text-[13px] font-semibold text-muted';
const perMonth = <span className="text-sm font-semibold tracking-normal text-muted"> /mo</span>;

/* The recurring and discretionary split of monthly income, as a bar with its key */
export const IncomeSplit = ({ share, compact = false }: { share: number; compact?: boolean }) => (
  <div className="flex flex-col gap-2.5">
    <div
      role="img"
      aria-label={`Recurring ${share.toFixed(1)}%, discretionary ${(100 - share).toFixed(1)}% of monthly income`}
      className={cn(
        'flex overflow-hidden rounded-full',
        compact ? 'h-2.5 gap-[3px]' : 'h-3 gap-1'
      )}>
      <div className="rounded-full bg-border-strong" style={{ width: `${share.toFixed(1)}%` }} />
      <div className="grow rounded-full bg-accent" />
    </div>
    <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-muted">
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="size-2.5 rounded bg-border-strong" />
        Recurring <span className="num font-extrabold text-text">{share.toFixed(1)}%</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span aria-hidden="true" className="size-2.5 rounded bg-accent" />
        Discretionary{' '}
        <span className="num font-extrabold text-text">{(100 - share).toFixed(1)}%</span>
      </span>
    </div>
  </div>
);

/* Desktop: monthly income, recurring payments and what's left, side by side */
export const MonthlyStats = ({ dashboard }: { dashboard: Dashboard }) => {
  const { summary, isEmpty, incomeEditor: editor, monthlyIncome, payday } = dashboard;
  const openAdd = usePaymentDialogStore(s => s.openAdd);
  const overspent = summary.discretionary < 0;

  return (
    <section
      aria-label="Monthly money"
      className="col-span-full grid grid-cols-1 rounded-3xl border border-border bg-surface min-[56.25rem]:grid-cols-3 [&>*+*]:border-t [&>*+*]:border-border min-[56.25rem]:[&>*+*]:border-t-0 min-[56.25rem]:[&>*+*]:border-l">
      <div className={statClasses}>
        <div className="flex min-h-5 items-center justify-between gap-2">
          <h2 className={labelClasses}>Monthly income</h2>
          {editor.editing ? null : (
            <IconButton
              aria-label="Edit monthly income"
              onClick={editor.start}
              className="-my-3 -mr-3">
              <PenLine size={17} aria-hidden="true" />
            </IconButton>
          )}
        </div>
        {editor.editing ? (
          <IncomeEditor editor={editor} id="income-edit" />
        ) : (
          <>
            <p className="num text-[32px] leading-[1.1] font-extrabold">
              {formatMoney(monthlyIncome)}
            </p>
            {isEmpty ? (
              <>
                <p className="text-[13px] font-medium text-muted">No income set yet</p>
                <Button
                  variant="ghost"
                  onClick={editor.start}
                  className="-ml-3.5 self-start text-[13px] text-accent-text">
                  <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
                  Set monthly income
                </Button>
              </>
            ) : (
              <p className="text-[13px] font-medium text-muted">{paidText(payday)}</p>
            )}
          </>
        )}
      </div>

      <div className={statClasses}>
        <h2 className={labelClasses}>Monthly recurring</h2>
        <p className="num text-[32px] leading-[1.1] font-extrabold">
          {formatMoney(summary.monthlyRecurring)}
          {perMonth}
        </p>
        {isEmpty ? (
          <>
            <p className="text-[13px] font-medium text-muted">No recurring payments yet</p>
            <Button
              variant="ghost"
              onClick={() => openAdd('recurring')}
              className="-ml-3.5 self-start text-[13px] text-accent-text">
              <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
              Add recurring payment
            </Button>
          </>
        ) : (
          <p className="text-[13px] font-medium text-muted">
            {summary.annualRecurring > 0 ? (
              <>
                +{' '}
                <span className="num font-bold text-text">
                  {formatMoney(summary.annualRecurring)}
                </span>
                /yr annual ·{' '}
              </>
            ) : null}
            {summary.recurringCount}{' '}
            {summary.recurringCount === 1 ? 'recurring payment' : 'recurring payments'}
          </p>
        )}
      </div>

      <div className={statClasses}>
        <h2 className={labelClasses}>
          Discretionary income
          {overspent ? <OverdrawnPill>Overspent</OverdrawnPill> : null}
        </h2>
        <p
          className={cn(
            'num text-[32px] leading-[1.1] font-extrabold',
            overspent ? 'text-expense' : 'text-accent-text'
          )}>
          {formatBalance(summary.discretionary)}
          {perMonth}
        </p>
        {isEmpty ? (
          <p className="text-[13px] font-medium text-muted">
            Shown once you add income and payments
          </p>
        ) : (
          <div className="mt-0.5">
            <IncomeSplit share={summary.recurringShare} />
          </div>
        )}
      </div>
    </section>
  );
};
