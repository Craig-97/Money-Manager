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
  Payment,
  renewalNote
} from '~/lib/payments';
import { usePaymentSheetStore } from '~/state/paymentSheet';
import { PaymentTab } from '../../../dashboardModel';
import { Dashboard } from '../../../hooks';

interface MetaOptions {
  tab: PaymentTab;
  cycle: PayCycle;
  today: Date;
}

/*
 * The line under the name. "Into Joint bills" takes the category's place, and money moving between
 * two accounts that count ends "· Not in totals", with no hover card on a phone to say so.
 */
const metaFor = (payment: Payment, { tab, cycle, today }: MetaOptions) => {
  const into = intoText(payment);
  const renewal = renewalNote(payment, today);
  const category = (into ?? categoryLabel(payment.category)) + (renewal ? ` · ${renewal}` : '');
  const meta =
    tab === 'recurring' && payment.kind === 'recurring'
      ? `${FREQUENCY_LABELS[payment.frequency]} · ${cycleStatus(payment, cycle).label}`
      : tab === 'oneOff'
        ? `${payment.type === 'INCOME' ? 'Income' : 'Expense'} · ${category}`
        : `${payment.kind === 'recurring' ? 'Recurring' : 'One-off'} · ${category}`;
  return movesTo(payment) ? `${meta} · Not in totals` : meta;
};

export const MobileRow = ({ payment, dashboard }: { payment: Payment; dashboard: Dashboard }) => {
  const { tab, today, cycle, selection } = dashboard;
  const { selecting, toggle } = selection;
  const openSheet = usePaymentSheetStore(s => s.openFor);
  const notes = dashboard.notesFor(payment.id);
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
            : `${payment.name}${notes.length ? `, ${notes.length} ${notes.length === 1 ? 'note' : 'notes'}` : ''}`
        }
        aria-haspopup={selecting ? undefined : 'dialog'}
        onClick={() => (selecting ? toggle(payment.id) : openSheet(payment.id))}
        className="flex min-h-[68px] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] text-left">
        <PaymentLetter payment={payment} className="size-10 rounded-[13px] text-[15px]" />
        <span className="min-w-0 grow">
          <span className="flex items-center gap-1.5 text-[15px] font-bold">
            <span className="min-w-0">{payment.name}</span>
            {tab === 'upcoming' ? (
              <TimesDue payment={payment} cycle={cycle} today={today} hint={false} />
            ) : null}
            <NoteChip payment={payment} notes={notes} hint={false} />
          </span>
          {/* A debt says what's left, as on Recurring; its status still shows on the recurring tab */}
          {payment.kind === 'recurring' && isDebt(payment) && tab !== 'recurring' ? (
            <DebtLeft debt={payment} className="mt-[5px] text-xs font-medium text-muted" />
          ) : (
            <span className="mt-[3px] flex items-center gap-[5px] text-xs font-medium text-muted">
              {payment.kind === 'recurring' ? (
                <Repeat size={12} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
              ) : null}
              {metaFor(payment, { tab, cycle, today })}
            </span>
          )}
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
        </span>
      </button>
    </div>
  );
};
