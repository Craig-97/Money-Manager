import { Check, ListFilter, Plus, Repeat, Trash } from 'lucide-react';
import { useShallow } from 'zustand/react/shallow';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { Button } from '~/components/ui/Button';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { cn } from '~/lib/cn';
import { formatPayment } from '~/lib/format';
import { categoryLabel, formatShortDate, isInCycle, Payment, scheduleText } from '~/lib/payments';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { dueInfo, PaymentTab, TABS } from '../dashboardModel';
import { Dashboard } from '../hooks';
import {
  DueCell,
  EmptyPayments,
  footLabel,
  greenTagClasses,
  KindTag,
  PaidTag,
  PaymentLetter,
  PaymentMenu,
  redTagClasses,
  StatusTag
} from './paymentParts';

// The design's .trow grid; the fourth column drops below 1101px
const rowClasses =
  'grid min-h-[66px] grid-cols-[44px_minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1fr)_120px_44px] items-center gap-x-3 rounded-2xl px-2 transition-colors wide:grid-cols-[44px_minmax(0,1.7fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_128px_44px]';

const HEADINGS: Record<PaymentTab, [string, string, string]> = {
  upcoming: ['Type', 'Category', 'Due'],
  recurring: ['Frequency', 'Next due', 'Status'],
  oneOff: ['Type', 'Category', 'Date']
};

const counts = (dashboard: Dashboard) => {
  const { payments, cycle } = dashboard;
  return {
    upcoming: payments.filter(p => isInCycle(p, cycle)).length,
    recurring: payments.filter(p => p.kind === 'recurring').length,
    oneOff: payments.filter(p => p.kind === 'oneOff').length
  };
};

export const tabOptions = (dashboard: Dashboard) => {
  const count = counts(dashboard);
  return TABS.map(tab => ({ ...tab, count: count[tab.value] }));
};

/* Opens the right add form for the tab: upcoming asks which kind first */
export const useAddForTab = (tab: PaymentTab) => {
  const { openAdd, openChooser } = usePaymentDialogStore(
    useShallow(s => ({ openAdd: s.openAdd, openChooser: s.openChooser }))
  );
  return () =>
    tab === 'recurring'
      ? openAdd('recurring')
      : tab === 'oneOff'
        ? openAdd('oneOff')
        : openChooser();
};

interface RowProps {
  payment: Payment;
  dashboard: Dashboard;
}

const PaymentRow = ({ payment, dashboard }: RowProps) => {
  const { tab, today, cycle, selected, toggleSelected } = dashboard;
  const openEdit = usePaymentDialogStore(s => s.openEdit);
  const due = dueInfo(payment, today, cycle);
  const isSelected = selected.has(payment.id);
  const paid = payment.state === 'paid';
  const checkboxId = `payment-${tab}-${payment.id}`;
  const category = categoryLabel(payment.category);

  return (
    <div role="row" className={cn(rowClasses, isSelected ? 'bg-accent-soft' : 'hover:bg-hover')}>
      <span role="cell">
        <CheckboxHitArea htmlFor={checkboxId}>
          <Checkbox
            id={checkboxId}
            checked={isSelected}
            onChange={() => toggleSelected(payment.id)}
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
            {paid && tab !== 'recurring' ? <PaidTag /> : null}
          </div>
          <p className="mt-0.5 text-xs font-medium text-muted">
            {tab === 'oneOff' ? 'One-off' : category}
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
            <StatusTag payment={payment} />
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
        <PaymentMenu payment={payment} dashboard={dashboard} />
      </span>
    </div>
  );
};

/* Desktop: the payments in a table, with tabs, sorting and bulk actions */
export const PaymentsTable = ({ dashboard }: { dashboard: Dashboard }) => {
  const { tab, setTab, listed, selectedPayments, ascending, toggleSort, cycle, actions } =
    dashboard;
  const add = useAddForTab(tab);
  const allSelected = listed.length > 0 && selectedPayments.length === listed.length;
  const net = listed.reduce((total, payment) => total + payment.signedAmount, 0);
  const [typeHeading, middleHeading, lastHeading] = HEADINGS[tab];

  const selectAll = (
    <CheckboxHitArea htmlFor={`select-all-${tab}`}>
      <Checkbox
        id={`select-all-${tab}`}
        checked={allSelected}
        indeterminate={selectedPayments.length > 0 && !allSelected}
        onChange={() => dashboard.selectAll(!allSelected)}
        aria-label="Select all payments"
      />
    </CheckboxHitArea>
  );

  return (
    <article
      aria-labelledby="payments-title"
      className="col-span-full flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-4">
          <h2 id="payments-title" className="text-[19px] font-extrabold tracking-[-0.02em]">
            Payments
          </h2>
          <SegmentedControl
            aria-label="Payment lists"
            value={tab}
            onValueChange={setTab}
            options={tabOptions(dashboard)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={add} className="text-[13px] text-accent-text">
            <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
            Add
          </Button>
          <Button onClick={toggleSort} className="text-[13px]">
            <ListFilter size={16} aria-hidden="true" />
            Sort: Date {ascending ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      <div role="table" aria-label="Payments">
        {selectedPayments.length ? (
          <div
            role="row"
            className="flex min-h-14 flex-wrap items-center gap-2.5 rounded-2xl bg-accent-soft px-2">
            {selectAll}
            <p className="mr-1.5 num text-sm font-extrabold text-accent-text">
              {selectedPayments.length} selected
            </p>
            <span aria-hidden="true" className="h-6 w-px bg-border-strong" />
            <Button
              variant="solid"
              className="text-[13px]"
              onClick={() => {
                void actions.setPaid(selectedPayments, true);
                dashboard.clearSelection();
              }}>
              <Check size={16} strokeWidth={2.5} aria-hidden="true" />
              Mark as paid
            </Button>
            <Button
              variant="danger"
              className="text-[13px]"
              onClick={() => {
                void actions.remove(selectedPayments);
                dashboard.clearSelection();
              }}>
              <Trash size={16} aria-hidden="true" />
              Delete
            </Button>
            <Button
              variant="ghost"
              onClick={dashboard.clearSelection}
              className="ml-auto text-[13px]">
              Clear
            </Button>
          </div>
        ) : listed.length ? (
          <div
            role="row"
            className={cn(
              rowClasses,
              'min-h-[52px] text-xs font-bold tracking-[0.04em] text-muted uppercase'
            )}>
            <span role="cell">{selectAll}</span>
            <span role="columnheader">Payment</span>
            <span role="columnheader">{typeHeading}</span>
            <span role="columnheader" className="hidden wide:block">
              {middleHeading}
            </span>
            <span role="columnheader">{lastHeading}</span>
            <span role="columnheader" className="text-right">
              Amount
            </span>
            <span />
          </div>
        ) : null}

        {listed.length ? (
          <>
            <div className="flex flex-col gap-0.5 border-t border-border pt-1.5">
              {listed.map(payment => (
                <PaymentRow key={payment.id} payment={payment} dashboard={dashboard} />
              ))}
            </div>
            <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-border px-4 pt-4 pb-1 pl-5">
              <p className="text-[13px] font-semibold text-muted">
                {footLabel(listed.length, tab, formatShortDate(cycle.end))}
              </p>
              <p className="flex items-baseline gap-2.5">
                <span className="text-[13px] font-semibold text-muted">Net total</span>
                <span
                  className={cn(
                    'num text-xl font-extrabold',
                    net >= 0 ? 'text-income' : 'text-expense'
                  )}>
                  {formatPayment(net)}
                </span>
              </p>
            </div>
          </>
        ) : (
          <EmptyPayments tab={tab} onAdd={add} />
        )}
      </div>
    </article>
  );
};
