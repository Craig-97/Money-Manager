import { Repeat } from 'lucide-react';
import { DebtLeft } from '~/components/debts';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import {
  DueCell,
  NoteChip,
  PaymentAmount,
  PaymentLetter,
  PaymentMenu,
  RenewalTag,
  StatusTag,
  TimesDue
} from '~/components/payments/PaymentParts';
import { cn } from '~/lib/cn';
import { isDebt } from '~/lib/debts';
import {
  categoryLabel,
  dueInfo,
  intoText,
  RecurringPayment,
  renewalOf,
  scheduleText
} from '~/lib/payments';
import { usePaymentSheetStore } from '~/state/paymentSheet';
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
  const openSheet = usePaymentSheetStore(s => s.openFor);
  // Before payday is about what's left to pay, so it shows where each payment stands this cycle.
  // Renewals have their own tab.
  const beforePayday = tab === 'cycle';
  const renewal = beforePayday ? null : renewalOf(payment, today);
  const into = intoText(payment);
  const isSelected = selection.selected.has(payment.id);
  const checkboxId = `recurring-${payment.id}`;

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
            {beforePayday ? <TimesDue payment={payment} cycle={cycle} today={today} /> : null}
            <NoteChip payment={payment} notes={notes} />
          </div>
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
            ) : renewal ? (
              <RenewalTag renewal={renewal} today={today} className="h-[22px] wide:hidden" />
            ) : null}
          </div>
        </div>
      </div>
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
        ) : renewal ? (
          <RenewalTag renewal={renewal} today={today} short />
        ) : (
          <span className="text-sm text-faint">—</span>
        )}
      </span>
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
