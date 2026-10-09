import { Repeat } from 'lucide-react';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { PaymentLetter, TimesDue } from '~/components/payments/PaymentParts';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import {
  categoryLabel,
  cycleStatus,
  dueInfo,
  FREQUENCY_LABELS,
  RecurringPayment,
  renewalOf,
  renewalTag
} from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { Recurring } from '../../hooks';
import { RecurringTab } from '../../recurringModel';

/*
 * The line under the name, as the dashboard's mobile rows have it: how often, then before payday
 * where it stands this cycle ("Weekly · 1 of 4 paid"), otherwise its renewal ("Monthly · Renews
 * 2 Feb 2027"), or its category when it doesn't renew
 */
const subtitle = (payment: RecurringPayment, tab: RecurringTab, cycle: PayCycle, today: Date) => {
  const frequency = FREQUENCY_LABELS[payment.frequency];
  if (tab === 'cycle') return `${frequency} · ${cycleStatus(payment, cycle).label}`;
  const renewal = renewalOf(payment, today);
  return `${frequency} · ${renewal ? renewalTag(renewal, today) : categoryLabel(payment.category)}`;
};

/*
 * One payment: name, how often with its renewal or next date, the amount and when it's next due.
 * Tapping opens it, or ticks it in select mode.
 */
export const MobileRecurringRow = ({
  payment,
  recurring
}: {
  payment: RecurringPayment;
  recurring: Recurring;
}) => {
  const { tab, today, cycle, selection } = recurring;
  const { selecting, toggle } = selection;
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const due = dueInfo(payment, today, cycle);
  const isSelected = selecting && selection.selected.has(payment.id);
  const urgent = due.state === 'today' || due.state === 'overdue';

  return (
    <div
      className={cn(
        'flex min-h-[68px] items-center gap-3 rounded-[18px] px-2.5 transition-colors',
        isSelected ? 'bg-accent-soft' : 'hover:bg-hover'
      )}>
      {selecting ? (
        <CheckboxHitArea htmlFor={`recurring-mobile-${payment.id}`} className="-ml-2">
          <Checkbox
            id={`recurring-mobile-${payment.id}`}
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
            : `Edit ${payment.name}`
        }
        aria-haspopup={selecting ? undefined : 'dialog'}
        onClick={() => (selecting ? toggle(payment.id) : openEdit('recurring', payment.id))}
        className="flex min-h-[68px] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] text-left">
        <PaymentLetter payment={payment} className="size-10 rounded-[13px] text-[15px]" />
        <span className="min-w-0 grow">
          <span className="flex items-center gap-1.5 text-[15px] font-bold">
            <span className="truncate">{payment.name}</span>
            {tab === 'cycle' ? (
              <TimesDue payment={payment} cycle={cycle} today={today} hint={false} />
            ) : null}
          </span>
          <span className="mt-[3px] flex min-w-0 items-center gap-[5px] text-xs font-medium text-muted">
            <Repeat size={12} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
            <span className="truncate">{subtitle(payment, tab, cycle, today)}</span>
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span
            className={cn(
              'block num text-[15px] font-extrabold',
              payment.signedAmount < 0 ? 'text-expense' : 'text-income'
            )}>
            {formatPayment(payment.signedAmount)}
          </span>
          <span
            className={cn(
              'mt-[3px] block text-xs',
              urgent ? 'font-bold text-expense' : 'font-semibold text-muted'
            )}>
            {due.state === 'overdue' ? `Overdue · ${due.label}` : due.label}
          </span>
        </span>
      </button>
    </div>
  );
};
