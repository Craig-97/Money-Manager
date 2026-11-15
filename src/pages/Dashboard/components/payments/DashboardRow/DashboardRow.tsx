import { Repeat } from 'lucide-react';
import { DebtLeft } from '~/components/debts';
import {
  DueCell,
  greenTagClasses,
  KindTag,
  PaymentRowEnd,
  PaymentRowStart,
  redTagClasses,
  StatusTag
} from '~/components/payments';
import { cn } from '~/lib/cn';
import { isDebt } from '~/lib/debts';
import {
  categoryLabel,
  dueInfo,
  intoText,
  Payment,
  renewalNote,
  scheduleText
} from '~/lib/payments';
import { Dashboard } from '../../../hooks';
import { rowClasses } from '../rowClasses';

interface RowProps {
  payment: Payment;
  dashboard: Dashboard;
}

export const DashboardRow = ({ payment, dashboard }: RowProps) => {
  const { tab, today, cycle, selection, actions } = dashboard;
  const notes = dashboard.notesFor(payment.id);
  const due = dueInfo(payment, { today, cycle });
  const category = categoryLabel(payment.category);
  // "Into Joint bills" says where it goes, in place of the category under the name
  const detail = intoText(payment) ?? category;
  // A renewal coming up shows by the category: "Insurance · Renews in 22 days"
  const renewal = renewalNote(payment, today);

  return (
    <div
      role="row"
      className={cn(
        rowClasses,
        selection.selected.has(payment.id) ? 'bg-accent-soft' : 'hover:bg-hover'
      )}>
      <PaymentRowStart
        payment={payment}
        checkboxId={`payment-${tab}-${payment.id}`}
        selection={selection}
        notes={notes}
        timesDue={tab === 'upcoming' ? { cycle, today } : null}>
        {/* A debt says what's left, as on Recurring */}
        {isDebt(payment) ? (
          <DebtLeft debt={payment} className="mt-[5px] text-xs font-medium text-muted" />
        ) : (
          <p className="mt-0.5 text-xs font-medium text-muted">
            {tab === 'oneOff' ? 'One-off' : renewal ? `${detail} · ${renewal}` : detail}
          </p>
        )}
      </PaymentRowStart>

      {tab === 'upcoming' ? (
        <>
          <span role="cell">
            <KindTag payment={payment} />
          </span>
          <span role="cell" className="hidden text-sm font-medium text-muted wide:block">
            {category}
          </span>
          <span role="cell">
            <DueCell due={due} />
          </span>
        </>
      ) : null}

      {tab === 'recurring' && payment.kind === 'recurring' ? (
        <>
          <span role="cell" className="flex items-center gap-2 text-sm font-semibold">
            <Repeat size={15} className="shrink-0 text-muted" aria-hidden="true" />
            {scheduleText(payment.firstPaymentDate, { frequency: payment.frequency })}
          </span>
          <span role="cell" className="hidden wide:block">
            <DueCell due={due} />
          </span>
          <span role="cell">
            <StatusTag payment={payment} cycle={cycle} />
          </span>
        </>
      ) : null}

      {tab === 'oneOff' ? (
        <>
          <span role="cell">
            <span className={payment.type === 'INCOME' ? greenTagClasses : redTagClasses}>
              {payment.type === 'INCOME' ? 'Income' : 'Expense'}
            </span>
          </span>
          <span role="cell" className="hidden text-sm font-medium text-muted wide:block">
            {category}
          </span>
          <span role="cell">
            <DueCell due={due} />
          </span>
        </>
      ) : null}

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
