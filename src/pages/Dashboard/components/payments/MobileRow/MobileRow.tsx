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
  Payment,
  renewalNote
} from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { PaymentTab } from '../../../dashboardModel';
import { Dashboard } from '../../../hooks';

const metaFor = (payment: Payment, tab: PaymentTab, cycle: PayCycle, today: Date) => {
  const renewal = renewalNote(payment, today);
  const category = categoryLabel(payment.category) + (renewal ? ` · ${renewal}` : '');
  if (tab === 'recurring' && payment.kind === 'recurring') {
    return `${FREQUENCY_LABELS[payment.frequency]} · ${cycleStatus(payment, cycle).label}`;
  }
  if (tab === 'oneOff') return `${payment.type === 'INCOME' ? 'Income' : 'Expense'} · ${category}`;
  return `${payment.kind === 'recurring' ? 'Recurring' : 'One-off'} · ${category}`;
};

export const MobileRow = ({ payment, dashboard }: { payment: Payment; dashboard: Dashboard }) => {
  const { tab, today, cycle, selection } = dashboard;
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
        <CheckboxHitArea htmlFor={`mobile-${payment.id}`} className="-ml-2">
          <Checkbox
            id={`mobile-${payment.id}`}
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
        onClick={() => (selecting ? toggle(payment.id) : openEdit(payment.kind, payment.id))}
        className="flex min-h-[68px] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] text-left">
        <PaymentLetter payment={payment} className="size-10 rounded-[13px] text-[15px]" />
        <span className="min-w-0 grow">
          <span className="flex items-center gap-1.5 text-[15px] font-bold">
            <span className="truncate">{payment.name}</span>
            {tab === 'upcoming' ? (
              <TimesDue payment={payment} cycle={cycle} today={today} hint={false} />
            ) : null}
          </span>
          <span className="mt-[3px] flex items-center gap-[5px] truncate text-xs font-medium text-muted">
            {payment.kind === 'recurring' ? (
              <Repeat size={12} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
            ) : null}
            {metaFor(payment, tab, cycle, today)}
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
              urgent ? 'font-bold text-expense' : 'font-medium text-muted'
            )}>
            {due.state === 'overdue' ? `Overdue · ${due.label}` : due.label}
          </span>
        </span>
      </button>
    </div>
  );
};
