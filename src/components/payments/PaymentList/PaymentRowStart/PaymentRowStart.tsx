import { ReactNode } from 'react';
import { PaymentSelection } from '~/hooks/usePaymentSelection';
import { PayCycle } from '~/lib/payday';
import { Payment } from '~/lib/payments';
import { usePaymentSheetStore } from '~/state/paymentSheet';
import { Checkbox, CheckboxHitArea } from '../../../form';
import { NoteChip, PaymentLetter, TimesDue } from '../../PaymentParts';

interface PaymentRowStartProps {
  payment: Payment;
  // The row's checkbox id, unique on the page
  checkboxId: string;
  selection: PaymentSelection;
  notes: Parameters<typeof NoteChip>[0]['notes'];
  // Shows ×2 by the name when it's due more than once before payday
  timesDue: { cycle: PayCycle; today: Date } | null;
  // The line under the name
  children: ReactNode;
}

/*
 * A table row's first two cells: its checkbox, then the payment's letter and name, which opens it,
 * with the line under the name
 */
export const PaymentRowStart = ({
  payment,
  checkboxId,
  selection,
  notes,
  timesDue,
  children
}: PaymentRowStartProps) => {
  const openSheet = usePaymentSheetStore(s => s.openFor);

  return (
    <>
      <span role="cell">
        <CheckboxHitArea htmlFor={checkboxId}>
          <Checkbox
            id={checkboxId}
            checked={selection.selected.has(payment.id)}
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
            {timesDue ? <TimesDue payment={payment} {...timesDue} /> : null}
            <NoteChip payment={payment} notes={notes} />
          </div>
          {children}
        </div>
      </div>
    </>
  );
};
