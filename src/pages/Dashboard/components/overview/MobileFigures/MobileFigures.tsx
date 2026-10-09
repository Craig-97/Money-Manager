import { PenLine, Repeat } from 'lucide-react';
import { ApproximatelyEqual } from '~/components/payments/PaymentParts';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { cn } from '~/lib/cn';
import { formatBalance, formatMoney } from '~/lib/format';
import { formatShortDate } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Dashboard } from '../../../hooks';
import { FigureRow } from '../FigureRow';
import { IncomeEditor } from '../IncomeEditor';
import { OverdrawnPill } from '../OverdrawnPill';

/* Mobile: payday balance, after recurring, income and recurring as a list */
export const MobileFigures = ({ dashboard }: { dashboard: Dashboard }) => {
  const { summary, cycle, isEmpty, monthlyIncome, incomeEditor: editor } = dashboard;
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <article className="flex flex-col rounded-3xl border border-border bg-surface px-5 py-2">
      {isEmpty ? (
        <div className="flex flex-col items-start gap-2.5 border-b border-border py-3.5">
          <p className="text-[13px] font-medium text-muted">
            Add your income and payments to see your balance on payday
          </p>
          <Button variant="accent" onClick={() => openAdd('recurring')}>
            <Repeat size={16} strokeWidth={2.25} aria-hidden="true" />
            Add recurring payment
          </Button>
        </div>
      ) : (
        <>
          <FigureRow
            label={
              <>
                Payday balance
                {summary.onPayday < 0 ? <OverdrawnPill /> : null}
              </>
            }
            value={
              <span className={cn(summary.onPayday < 0 && 'text-expense')}>
                {formatBalance(summary.onPayday)}
              </span>
            }
            aside={formatShortDate(cycle.end)}
          />
          <FigureRow
            label={
              <>
                After recurring
                {summary.afterRecurring < 0 ? <OverdrawnPill /> : null}
              </>
            }
            value={
              <span className={cn(summary.afterRecurring < 0 && 'text-expense')}>
                {formatBalance(summary.afterRecurring)}
              </span>
            }
            aside={
              <>
                Once bills
                <br />
                are paid
              </>
            }
          />
        </>
      )}
      <div className="border-b border-border py-3.5">
        <div className="-mr-2.5 flex min-h-11 items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-muted">Monthly income</p>
            {editor.editing ? null : (
              <p className="mt-0.5 num text-2xl font-extrabold">{formatMoney(monthlyIncome)}</p>
            )}
          </div>
          {editor.editing ? null : (
            <IconButton aria-label="Edit monthly income" onClick={editor.start}>
              <PenLine size={18} aria-hidden="true" />
            </IconButton>
          )}
        </div>
        {editor.editing ? (
          <div className="mt-2 flex flex-col gap-2.5">
            <IncomeEditor editor={editor} id="income-edit-mobile" />
          </div>
        ) : null}
      </div>
      <FigureRow
        last
        label="Monthly recurring"
        value={
          <>
            <ApproximatelyEqual averaged={summary.averagedRecurring} hint={false} />
            {(summary.monthlyRecurring < 0 ? '+' : '') + formatMoney(summary.monthlyRecurring)}
          </>
        }
        aside={
          summary.annualRecurring > 0 ? (
            <>
              +{' '}
              <span className="num font-bold text-text">
                {formatMoney(summary.annualRecurring)}
              </span>
              <br />
              /yr annual
            </>
          ) : null
        }
      />
    </article>
  );
};
