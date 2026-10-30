import { Repeat } from 'lucide-react';
import { DebtLeft } from '~/components/debts';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import {
  NoteChip,
  PaymentAmount,
  PaymentLetter,
  TimesDue
} from '~/components/payments/PaymentParts';
import { cn } from '~/lib/cn';
import { isDebt } from '~/lib/debts';
import { PayCycle } from '~/lib/payday';
import {
  categoryLabel,
  cycleStatus,
  dueInfo,
  FREQUENCY_LABELS,
  intoText,
  movesTo,
  RecurringPayment,
  renewalOf,
  renewalTag
} from '~/lib/payments';
import { usePaymentSheetStore } from '~/state/paymentSheet';
import { Recurring } from '../../hooks';
import { RecurringTab } from '../../recurringModel';

/*
 * The line under the name, as the dashboard's mobile rows have it: how often, then before payday
 * where it stands this cycle ("Weekly · 1 of 4 paid"), otherwise its renewal ("Monthly · Renews
 * 2 Feb 2027"), otherwise the account it pays into ("Monthly · Into Cash ISA"), or its category.
 * Money moving between two accounts that count ends "· Not in totals", with no hover card to say so.
 */
const subtitle = (
  payment: RecurringPayment,
  { tab, cycle, today }: { tab: RecurringTab; cycle: PayCycle; today: Date }
) => {
  const frequency = FREQUENCY_LABELS[payment.frequency];
  const renewal = tab === 'cycle' ? null : renewalOf(payment, today);
  const detail =
    tab === 'cycle'
      ? cycleStatus(payment, cycle).label
      : renewal
        ? renewalTag(renewal, today)
        : (intoText(payment) ?? categoryLabel(payment.category));
  return `${frequency} · ${detail}${movesTo(payment) ? ' · Not in totals' : ''}`;
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
  const openSheet = usePaymentSheetStore(s => s.openFor);
  const notes = recurring.notesFor(payment.id);
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
            : `${payment.name}${notes.length ? `, ${notes.length} ${notes.length === 1 ? 'note' : 'notes'}` : ''}`
        }
        aria-haspopup={selecting ? undefined : 'dialog'}
        onClick={() => (selecting ? toggle(payment.id) : openSheet(payment.id))}
        className="flex min-h-[68px] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] text-left">
        <PaymentLetter payment={payment} className="size-10 rounded-[13px] text-[15px]" />
        <span className="min-w-0 grow">
          <span className="flex items-center gap-1.5 text-[15px] font-bold">
            <span>{payment.name}</span>
            {tab === 'cycle' ? (
              <TimesDue payment={payment} cycle={cycle} today={today} hint={false} />
            ) : null}
            <NoteChip payment={payment} notes={notes} hint={false} />
          </span>
          {isDebt(payment) && tab !== 'cycle' ? (
            <DebtLeft debt={payment} className="mt-[5px] text-xs font-medium text-muted" />
          ) : (
            <span className="mt-[3px] flex min-w-0 items-center gap-[5px] text-xs font-medium text-muted">
              <Repeat size={12} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
              <span>{subtitle(payment, { tab, cycle, today })}</span>
            </span>
          )}
        </span>
        <span className="shrink-0 text-right">
          <PaymentAmount payment={payment} hint={false} className="block text-[15px]" />
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
