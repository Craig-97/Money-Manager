import { Repeat } from 'lucide-react';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import {
  DueCell,
  greenTagClasses,
  KindTag,
  PaymentLetter,
  PaymentMenu,
  redTagClasses,
  StatusTag,
  TimesDue
} from '~/components/payments/PaymentParts';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';
import { categoryLabel, dueInfo, Payment, renewalNote, scheduleText } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Dashboard } from '../../../hooks';
import { rowClasses } from '../rowClasses';

interface RowProps {
  payment: Payment;
  dashboard: Dashboard;
}

export const PaymentRow = ({ payment, dashboard }: RowProps) => {
  const { tab, today, cycle, selection, actions } = dashboard;
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const due = dueInfo(payment, today, cycle);
  const isSelected = selection.selected.has(payment.id);
  const checkboxId = `payment-${tab}-${payment.id}`;
  const category = categoryLabel(payment.category);
  // A renewal coming up shows by the category: "Insurance · Renews in 22 days"
  const renewal = renewalNote(payment, today);

  return (
    <div role="row" className={cn(rowClasses, isSelected ? 'bg-accent-soft' : 'hover:bg-hover')}>
      <span role="cell">
        <CheckboxHitArea htmlFor={checkboxId}>
          <Checkbox
            id={checkboxId}
            checked={isSelected}
            onChange={() => selection.toggle(payment.id)}
            aria-label={`Select ${payment.name}`}
          />
        </CheckboxHitArea>
      </span>
      <div role="cell" className="flex min-w-0 items-center gap-3">
        <PaymentLetter payment={payment} className="size-[38px] rounded-xl text-sm" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[15px] font-bold">
            <button
              type="button"
              aria-label={`Edit ${payment.name}`}
              onClick={() => openEdit(payment.kind, payment.id)}
              className="-my-[11px] min-w-0 cursor-pointer truncate rounded-lg py-[11px] text-left leading-[22px] hover:text-accent-text hover:underline hover:underline-offset-3">
              {payment.name}
            </button>
            {tab === 'upcoming' ? <TimesDue payment={payment} cycle={cycle} today={today} /> : null}
          </div>
          <p className="mt-0.5 text-xs font-medium text-muted">
            {tab === 'oneOff' ? 'One-off' : renewal ? `${category} · ${renewal}` : category}
          </p>
        </div>
      </div>

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
            {scheduleText(payment.firstPaymentDate, payment.frequency)}
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

      <span
        role="cell"
        className={cn(
          'text-right num text-[15px] font-extrabold',
          payment.signedAmount < 0 ? 'text-expense' : 'text-income'
        )}>
        {formatPayment(payment.signedAmount)}
      </span>
      <span role="cell" className="flex justify-end">
        <PaymentMenu payment={payment} cycle={cycle} today={today} actions={actions} />
      </span>
    </div>
  );
};
