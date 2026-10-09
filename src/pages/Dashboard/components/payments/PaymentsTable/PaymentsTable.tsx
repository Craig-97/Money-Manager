import { Plus } from 'lucide-react';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { BulkActions, SortMenu } from '~/components/payments/PaymentControls';
import { Button } from '~/components/ui/Button';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { formatShortDate } from '~/lib/payments';
import { PaymentTab } from '../../../dashboardModel';
import { Dashboard } from '../../../hooks';
import { EmptyPayments } from '../EmptyPayments';
import { PaymentRow } from '../PaymentRow';
import { footLabel } from '../paymentText';
import { rowClasses } from '../rowClasses';
import { tabOptions } from '../tabOptions';
import { TabTotal } from '../TabTotal';
import { useAddForTab } from '../useAddForTab';

const HEADINGS: Record<PaymentTab, [string, string, string]> = {
  upcoming: ['Type', 'Category', 'Due'],
  recurring: ['Frequency', 'Next due', 'Status'],
  oneOff: ['Type', 'Category', 'Date']
};

/* Desktop: the payments in a table, with tabs, sorting and bulk actions */
export const PaymentsTable = ({ dashboard }: { dashboard: Dashboard }) => {
  const { tab, setTab, listed, selection, sort, setSort, cycle, actions } = dashboard;
  const { selectedPayments, allSelected } = selection;
  const add = useAddForTab(tab);
  const [typeHeading, middleHeading, lastHeading] = HEADINGS[tab];

  const selectAll = (
    <CheckboxHitArea htmlFor={`select-all-${tab}`}>
      <Checkbox
        id={`select-all-${tab}`}
        checked={allSelected}
        indeterminate={selectedPayments.length > 0 && !allSelected}
        onChange={() => selection.selectAll(!allSelected)}
        aria-label="Select all payments"
      />
    </CheckboxHitArea>
  );

  return (
    <article
      aria-labelledby="payments-title"
      className={cn(
        tileLift,
        'col-span-full flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5'
      )}>
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
          <SortMenu sort={sort} onSort={setSort} />
        </div>
      </div>

      <div role="table" aria-label="Payments">
        {selectedPayments.length ? (
          <BulkActions
            selectAll={selectAll}
            count={selectedPayments.length}
            onPay={() => {
              void dashboard.paySelected();
              selection.clear();
            }}
            onDelete={() => {
              void actions.remove(selectedPayments);
              selection.clear();
            }}
            onClear={selection.clear}
          />
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
              <TabTotal dashboard={dashboard} />
            </div>
          </>
        ) : (
          <EmptyPayments tab={tab} onAdd={add} />
        )}
      </div>
    </article>
  );
};
