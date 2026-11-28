import { Repeat } from 'lucide-react';
import { DebtLeft } from '~/components/debts';
import {
  DueCell,
  PaymentRowEnd,
  PaymentRowStart,
  NextChangeTag,
  StatusTag
} from '~/components/payments';
import { cn } from '~/lib/cn';
import { isDebt } from '~/lib/debts';
import {
  categoryLabel,
  dueInfo,
  intoText,
  RecurringPayment,
  nextChangeOf,
  scheduleText
} from '~/lib/payments';
import { rowClasses } from './rowClasses';
import { Recurring } from '../../hooks';

export const RecurringRow = ({
  payment,
  recurring
}: {
  payment: RecurringPayment;
  recurring: Recurring;
}) => {
  const { tab, today, cycle, selection, actions } = recurring;
  const notes = recurring.notesFor(payment.id);
  // Before payday is about what's left to pay, so it shows where each payment stands this cycle.
  // Renewals have their own tab.
  const beforePayday = tab === 'cycle';
  const next = beforePayday ? null : nextChangeOf(payment, today);
  const into = intoText(payment);

  return (
    <div
      role="row"
      className={cn(
        rowClasses,
        selection.selected.has(payment.id) ? 'bg-accent-soft' : 'hover:bg-hover'
      )}>
      <PaymentRowStart
        payment={payment}
        checkboxId={`recurring-${payment.id}`}
        selection={selection}
        notes={notes}
        timesDue={beforePayday ? { cycle, today } : null}>
        <div className="mt-0.5 flex items-center gap-2 text-xs font-medium text-muted">
          {isDebt(payment) ? (
            <DebtLeft debt={payment} />
          ) : into ? (
            <span className="min-w-0">{into}</span>
          ) : (
            <span className="truncate">{categoryLabel(payment.category)}</span>
          )}
          {beforePayday ? (
            <StatusTag payment={payment} cycle={cycle} className="h-[22px] wide:hidden" />
          ) : next ? (
            <NextChangeTag next={next} today={today} className="h-[22px] wide:hidden" />
          ) : null}
        </div>
      </PaymentRowStart>
      <span
        role="cell"
        className="hidden items-center gap-2 text-sm font-semibold min-[82.5625rem]:flex">
        <Repeat size={15} className="shrink-0 text-muted" aria-hidden="true" />
        {scheduleText(payment.firstPaymentDate, { frequency: payment.frequency })}
      </span>
      <span role="cell">
        <DueCell due={dueInfo(payment, { today, cycle })} />
      </span>
      <span role="cell" className="hidden wide:block">
        {beforePayday ? (
          <StatusTag payment={payment} cycle={cycle} />
        ) : next ? (
          <NextChangeTag next={next} today={today} form="short" />
        ) : (
          <span className="text-sm text-faint">—</span>
        )}
      </span>
      <PaymentRowEnd
        payment={payment}
        cycle={cycle}
        today={today}
        actions={actions}
        noteCount={notes.length}
      />
    </div>
  );
};
