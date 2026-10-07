import { Repeat } from 'lucide-react';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';
import { categoryLabel, FREQUENCY_LABELS, formatShortDate, Payment } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { EmptyPayments, footLabel, PaymentLetter } from './paymentParts';
import { tabOptions, useAddForTab } from './PaymentsTable';
import { dueInfo, PaymentTab } from '../../dashboardModel';
import { Dashboard } from '../../hooks';

const metaFor = (payment: Payment, tab: PaymentTab) => {
  const category = categoryLabel(payment.category);
  if (tab === 'recurring' && payment.kind === 'recurring') {
    const status = !payment.dueDate
      ? 'Ended'
      : payment.state === 'paid'
        ? 'Paid'
        : payment.state === 'skipped'
          ? 'Skipped'
          : 'Unpaid';
    return `${FREQUENCY_LABELS[payment.frequency]} · ${status}`;
  }
  if (tab === 'oneOff') return `${payment.type === 'INCOME' ? 'Income' : 'Expense'} · ${category}`;
  return `${payment.kind === 'recurring' ? 'Recurring' : 'One-off'} · ${category}`;
};

const MobileRow = ({ payment, dashboard }: { payment: Payment; dashboard: Dashboard }) => {
  const { tab, today, cycle, selecting, selected, toggleSelected } = dashboard;
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const due = dueInfo(payment, today, cycle);
  const isSelected = selecting && selected.has(payment.id);
  const paid = payment.state === 'paid';
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
            onChange={() => toggleSelected(payment.id)}
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
        onClick={() =>
          selecting ? toggleSelected(payment.id) : openEdit(payment.kind, payment.id)
        }
        className="flex min-h-[68px] min-w-0 flex-1 cursor-pointer items-center gap-3 rounded-[14px] text-left">
        <PaymentLetter payment={payment} className="size-10 rounded-[13px] text-[15px]" />
        <span className="min-w-0 grow">
          <span className="flex items-center gap-1.5 text-[15px] font-bold">
            <span className="truncate">{payment.name}</span>
            {paid ? (
              <span className="rounded-full bg-income-bg px-[7px] py-[3px] text-[10px] font-bold text-income">
                Paid
              </span>
            ) : null}
          </span>
          <span className="mt-[3px] flex items-center gap-[5px] truncate text-xs font-medium text-muted">
            {payment.kind === 'recurring' ? (
              <Repeat size={12} strokeWidth={2.25} className="shrink-0" aria-hidden="true" />
            ) : null}
            {metaFor(payment, tab)}
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

/* Mobile: the payments as a list; Select turns on ticking several at once */
export const MobilePayments = ({ dashboard }: { dashboard: Dashboard }) => {
  const { tab, setTab, listed, ascending, toggleSort, cycle, selecting } = dashboard;
  const add = useAddForTab(tab);
  const net = listed.reduce((total, payment) => total + payment.signedAmount, 0);

  return (
    <article
      aria-labelledby="payments-title-mobile"
      className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-3">
      <div className="flex min-h-12 items-center justify-between pb-1 pl-2">
        <h2 id="payments-title-mobile" className="text-base font-extrabold tracking-[-0.02em]">
          Payments
        </h2>
        {dashboard.isEmpty ? null : (
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleSort}
              aria-label={`Sort by date, ${ascending ? 'ascending' : 'descending'}`}
              className="inline-flex h-11 cursor-pointer items-center rounded-full px-3 text-sm font-semibold text-muted hover:bg-hover">
              Date {ascending ? '↑' : '↓'}
            </button>
            <button
              type="button"
              onClick={dashboard.toggleSelecting}
              className="inline-flex h-11 cursor-pointer items-center rounded-full px-3 text-sm font-bold text-accent-text hover:bg-hover">
              {selecting ? 'Done' : 'Select'}
            </button>
          </div>
        )}
      </div>
      <SegmentedControl
        aria-label="Payment lists"
        value={tab}
        onValueChange={setTab}
        options={tabOptions(dashboard)}
        fullWidth
        className="[&>button]:h-11 [&>button]:px-1.5"
      />
      {listed.length ? (
        <>
          <div className="flex flex-col gap-0.5">
            {listed.map(payment => (
              <MobileRow key={payment.id} payment={payment} dashboard={dashboard} />
            ))}
          </div>
          <div className="mt-1 flex items-center justify-between border-t border-border px-2.5 pt-3.5 pb-1.5">
            <span className="text-[13px] font-semibold text-muted">
              {footLabel(listed.length, tab, formatShortDate(cycle.end))}
            </span>
            <span
              className={cn(
                'num text-lg font-extrabold',
                net >= 0 ? 'text-income' : 'text-expense'
              )}>
              {formatPayment(net)}
            </span>
          </div>
        </>
      ) : (
        <EmptyPayments tab={tab} onAdd={add} />
      )}
    </article>
  );
};

/* Mobile select mode: sits over the bottom nav with the bulk actions */
export const MobileBulkBar = ({ dashboard }: { dashboard: Dashboard }) => {
  const { selecting, selectedPayments, actions, stopSelecting } = dashboard;
  if (!selecting) return null;
  const none = selectedPayments.length === 0;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-45 flex justify-center bg-linear-to-t from-bg from-60% to-transparent px-4 pt-6 pb-[calc(22px+env(safe-area-inset-bottom))]">
      <div
        role="toolbar"
        aria-label="Bulk actions"
        className="pointer-events-auto flex w-full items-center gap-1.5 rounded-full border border-border bg-nav-bg py-1.5 pr-1.5 pl-[18px] text-nav-active-bg shadow-[0_18px_36px_-14px_var(--shadow)]">
        <span className="grow num text-sm font-extrabold">{selectedPayments.length} selected</span>
        <button
          type="button"
          disabled={none}
          onClick={() => {
            void actions.setPaid(selectedPayments, true);
            stopSelecting();
          }}
          className="inline-flex h-11 cursor-pointer items-center rounded-full bg-nav-active-bg px-4 text-[13px] font-bold text-nav-active-text disabled:cursor-default disabled:opacity-45">
          Mark paid
        </button>
        <button
          type="button"
          disabled={none}
          onClick={() => {
            void actions.remove(selectedPayments);
            stopSelecting();
          }}
          className="inline-flex h-11 cursor-pointer items-center rounded-full bg-expense-bg px-4 text-[13px] font-bold text-expense disabled:cursor-default disabled:opacity-45">
          Delete
        </button>
      </div>
    </div>
  );
};
