import { Repeat } from 'lucide-react';
import { DebtLeft } from '~/components/debts';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import {
  DueCell,
  greenTagClasses,
  KindTag,
  NoteChip,
  PaymentLetter,
  PaymentAmount,
  PaymentMenu,
  redTagClasses,
  StatusTag,
  TimesDue
} from '~/components/payments/PaymentParts';
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
import { usePaymentSheetStore } from '~/state/paymentSheet';
import { Dashboard } from '../../../hooks';
import { rowClasses } from '../rowClasses';

interface RowProps {
  payment: Payment;
  dashboard: Dashboard;
}

export const PaymentRow = ({ payment, dashboard }: RowProps) => {
  const { tab, today, cycle, selection, actions } = dashboard;
  const notes = dashboard.notesFor(payment.id);
  const openSheet = usePaymentSheetStore(s => s.openFor);
  const due = dueInfo(payment, { today, cycle });
  const isSelected = selection.selected.has(payment.id);
  const checkboxId = `payment-${tab}-${payment.id}`;
  const category = categoryLabel(payment.category);
  // "Into Joint bills" says where it goes, in place of the category under the name
  const detail = intoText(payment) ?? category;
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
              // Opens the payment: when it's due, its notes and quick actions, with Edit payment
              aria-haspopup="dialog"
              onClick={() => openSheet(payment.id)}
              className="-my-[11px] min-w-0 cursor-pointer truncate rounded-lg py-[11px] text-left leading-[22px] hover:text-accent-text hover:underline hover:underline-offset-3">
              {payment.name}
            </button>
            {tab === 'upcoming' ? <TimesDue payment={payment} cycle={cycle} today={today} /> : null}
            <NoteChip payment={payment} notes={notes} />
          </div>
          {/* A debt says what's left, as on Recurring */}
          {payment.kind === 'recurring' && isDebt(payment) ? (
            <DebtLeft debt={payment} className="mt-[5px] text-xs font-medium text-muted" />
          ) : (
            <p className="mt-0.5 text-xs font-medium text-muted">
              {tab === 'oneOff' ? 'One-off' : renewal ? `${detail} · ${renewal}` : detail}
            </p>
          )}
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

      <span role="cell" className="text-right">
        <PaymentAmount payment={payment} className="text-[15px]" />
      </span>
      <span role="cell" className="flex justify-end">
        <PaymentMenu
          payment={payment}
          cycle={cycle}
          today={today}
          actions={actions}
          noteCount={notes.length}
        />
      </span>
    </div>
  );
};
