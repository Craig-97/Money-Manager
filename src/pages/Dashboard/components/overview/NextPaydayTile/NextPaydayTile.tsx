import { ArrowRight, PenLine, Repeat } from 'lucide-react';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { Tile } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatMoney, formatPayment, MINUS } from '~/lib/format';
import { paydayText } from '~/lib/payday';
import { formatShortDate } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Dashboard } from '../../../hooks';
import { PaydayOverrideDialog } from '../../payday/PaydayOverrideDialog';
import { CycleBar } from '../CycleBar';
import { Figure } from '../Figure';

/* Desktop: days to payday, the cycle so far, and where the balance will be */
export const NextPaydayTile = ({ dashboard }: { dashboard: Dashboard }) => {
  const {
    cycle,
    summary,
    days,
    isEmpty,
    payday,
    monthlyIncome,
    paydayOverride: override
  } = dashboard;
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <Tile aria-label="Next payday" className="gap-[22px] p-7 md:p-7">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[15px] font-bold text-muted">Next payday</h2>
        <div className="-my-1.5 -mr-2.5 inline-flex items-center gap-0.5">
          <span
            className={cn(
              'rounded-full px-3.5 py-2 text-[13px] font-bold whitespace-nowrap',
              override.moved
                ? 'bg-accent font-extrabold text-on-accent'
                : 'bg-accent-soft text-accent-text'
            )}>
            {formatShortDate(cycle.end)}
          </span>
          {override.canChange ? (
            <IconButton aria-label="Change this payday" onClick={() => override.setOpen(true)}>
              <PenLine size={17} aria-hidden="true" />
            </IconButton>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex items-baseline gap-2.5">
          <span className="num text-[64px] leading-none font-extrabold tracking-[-0.05em]">
            {summary.daysToPayday}
          </span>
          <span className="text-[15px] font-bold text-muted">
            {summary.daysToPayday === 1 ? 'day to go' : 'days to go'}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {override.moved ? (
            <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-accent-soft px-2.5 text-xs font-bold whitespace-nowrap text-accent-text">
              <ArrowRight size={13} strokeWidth={2.25} aria-hidden="true" />
              Moved from {formatShortDate(override.usual)}
            </span>
          ) : null}
          <p className="text-[13px] font-medium text-muted">{paydayText(payday)}</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <CycleBar days={days} className="-my-[9px]" />
        <div className="flex flex-wrap justify-between gap-2 text-xs font-semibold text-muted">
          <span>Paid {formatShortDate(cycle.start)}</span>
          <span className="inline-flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-expense" />
              Out
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-full bg-income" />
              In
            </span>
          </span>
          {override.moved ? (
            <span className="inline-flex gap-2">
              <span className="font-bold text-text">{formatShortDate(cycle.end)}</span>
              <span className="text-faint">Usual {formatShortDate(override.usual)}</span>
            </span>
          ) : (
            <span>{formatShortDate(cycle.end)}</span>
          )}
        </div>
      </div>
      {isEmpty ? (
        <div className="mt-auto flex flex-col items-start gap-3 border-t border-border pt-5">
          <p className="text-[13px] font-medium text-muted">
            Add your income and payments to see your balance on payday
          </p>
          <Button variant="accent" onClick={() => openAdd('recurring')}>
            <Repeat size={16} strokeWidth={2.25} aria-hidden="true" />
            Add recurring payment
          </Button>
        </div>
      ) : (
        <div className="mt-auto grid grid-cols-2 gap-3 border-t border-border pt-5">
          <Figure
            label="Payday balance"
            amount={summary.onPayday}
            note={
              <>
                <span className="num font-bold text-income">{formatPayment(monthlyIncome)}</span>{' '}
                income
              </>
            }
          />
          <Figure
            label="After recurring"
            amount={summary.afterRecurring}
            note={
              <>
                <span
                  className={cn(
                    'num font-bold',
                    summary.monthlyRecurring < 0 ? 'text-income' : 'text-expense'
                  )}>
                  {summary.monthlyRecurring < 0 ? '+' : MINUS}
                  {formatMoney(summary.monthlyRecurring)}
                </span>{' '}
                next cycle
              </>
            }
          />
        </div>
      )}
      {override.canChange ? <PaydayOverrideDialog override={override} /> : null}
    </Tile>
  );
};
