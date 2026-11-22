import { ReactNode } from 'react';
import { PaymentSelection } from '~/hooks/usePaymentSelection';
import { cn } from '~/lib/cn';
import { plural } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import { dueInfo, Payment } from '~/lib/payments';
import { usePaymentSheetStore } from '~/state/paymentSheet';
import { Checkbox, CheckboxHitArea } from '../../../form';
import { NoteChip, PaymentAmount, PaymentIcon, TimesDue } from '../../PaymentParts';

interface MobilePaymentRowProps {
  payment: Payment;
  // The row's checkbox id, unique on the page
  checkboxId: string;
  selection: PaymentSelection;
  notes: Parameters<typeof NoteChip>[0]['notes'];
  cycle: PayCycle;
  today: Date;
  // Shows ×2 by the name when it's due more than once before payday
  timesDue: boolean;
  // The line under the name
  children: ReactNode;
}

/*
 * One payment on a phone: its name and the line under it, then the amount and when it's due.
 * Tapping opens it, or ticks it in select mode.
 */
export const MobilePaymentRow = ({
  payment,
  checkboxId,
  selection,
  notes,
  cycle,
  today,
  timesDue,
  children
}: MobilePaymentRowProps) => {
  const { selecting, toggle } = selection;
  const openSheet = usePaymentSheetStore(s => s.openFor);
  const due = dueInfo(payment, { today, cycle });
  const isSelected = selecting && selection.selected.has(payment.id);
  const urgent = due.state === 'today' || due.state === 'overdue';

  return (
    <div
      className={cn(
        'flex min-h-[68px] items-center gap-3 rounded-[18px] px-2.5 transition-colors',
        isSelected ? 'bg-accent-soft' : 'hover:bg-hover'
      )}>
      {selecting ? (
        <CheckboxHitArea htmlFor={checkboxId} className="-ml-2">
          <Checkbox
            id={checkboxId}
            size="md"
            checked={isSelected}
            onChange={() => toggle(payment.id)}
            aria-label={`Select ${payment.name}`}
          />
        </CheckboxHitArea>
      ) : null}
      <button
        type="button"
        aria-label={
          selecting
            ? `${isSelected ? 'Deselect' : 'Select'} ${payment.name}`
            : `${payment.name}${notes.length ? `, ${plural(notes.length, 'note')}` : ''}`
        }
        aria-haspopup={selecting ? undefined : 'dialog'}
        onClick={() => (selecting ? toggle(payment.id) : openSheet(payment.id))}
        className="flex min-h-[68px] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] text-left">
        <PaymentIcon payment={payment} className="size-10 rounded-[13px] text-[15px]" />
        <span className="min-w-0 grow">
          {/* The pills move under the name when there isn't room beside it, rather than over it */}
          <span className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[15px] font-bold">
            <span className="min-w-0 [overflow-wrap:anywhere]">{payment.name}</span>
            {timesDue ? (
              <TimesDue payment={payment} cycle={cycle} today={today} hint={false} />
            ) : null}
            <NoteChip payment={payment} notes={notes} hint={false} />
          </span>
          {children}
        </span>
        <span className="shrink-0 text-right">
          <PaymentAmount payment={payment} hint={false} className="block text-[15px]" />
          <span
            className={cn(
              'mt-[3px] block text-xs',
              urgent
                ? 'font-bold text-expense'
                : due.state === 'paid'
                  ? 'font-bold text-income'
                  : 'font-medium text-muted'
            )}>
            {due.state === 'overdue' || due.state === 'paid'
              ? `${due.detail} · ${due.label}`
              : due.label}
          </span>
          {due.moved ? (
            <span className="mt-0.5 block text-[11px] font-bold text-accent-text">
              {due.moved.short}
            </span>
          ) : null}
        </span>
      </button>
    </div>
  );
};
