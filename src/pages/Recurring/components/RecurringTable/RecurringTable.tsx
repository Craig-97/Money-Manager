import { Plus } from 'lucide-react';
import { Checkbox, CheckboxHitArea } from '~/components/form/Checkbox';
import { BulkActions, SortMenu } from '~/components/payments/PaymentControls';
import { Button } from '~/components/ui/Button';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { tileLift } from '~/components/ui/Tile';
import { cn } from '~/lib/cn';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { PAYMENTS_HEADING_ID, Recurring } from '../../hooks';
import { tabOptions } from '../../recurringModel';
import { ListFoot } from '../ListFoot';
import { NoMatches } from '../NoMatches';
import { PaymentFilters } from '../PaymentFilters';
import { RecurringRow, rowClasses } from '../RecurringRow';

/* Desktop: every recurring payment, with tabs, search, category, sorting and bulk actions */
export const RecurringTable = ({ recurring }: { recurring: Recurring }) => {
  const { tab, setTab, counts, listed, selection, sort, setSort, actions } = recurring;
  const { selectedPayments, allSelected } = selection;
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  const selectAll = (
    <CheckboxHitArea htmlFor="recurring-select-all">
      <Checkbox
        id="recurring-select-all"
        checked={allSelected}
        indeterminate={selectedPayments.length > 0 && !allSelected}
        onChange={() => selection.selectAll(!allSelected)}
        aria-label="Select all payments"
      />
    </CheckboxHitArea>
  );

  return (
    <article
      aria-labelledby={PAYMENTS_HEADING_ID}
      className={cn(
        tileLift,
        'flex flex-col gap-3.5 rounded-3xl border border-border bg-surface p-5'
      )}>
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex flex-wrap items-center gap-4">
          <h2
            id={PAYMENTS_HEADING_ID}
            className="scroll-mt-6 text-[19px] font-extrabold tracking-[-0.02em]">
            Payments
          </h2>
          <SegmentedControl
            aria-label="Payment lists"
            value={tab}
            onValueChange={setTab}
            options={tabOptions(counts)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => openAdd('recurring')}
            aria-label="Add recurring payment"
            className="text-[13px] text-accent-text">
            <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
            Add
          </Button>
          <SortMenu sort={sort} onSort={setSort} />
        </div>
      </div>

      {recurring.isEmpty ? null : <PaymentFilters recurring={recurring} />}

      <div role="table" aria-label="Recurring payments">
        {selectedPayments.length ? (
          <BulkActions
            selectAll={selectAll}
            count={selectedPayments.length}
            onPay={() => {
              void recurring.paySelected();
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
            <span role="columnheader" className="hidden min-[82.5625rem]:block">
              Frequency
            </span>
            <span role="columnheader">Next due</span>
            <span role="columnheader" className="hidden wide:block">
              {tab === 'cycle' ? 'Status' : 'Renewal'}
            </span>
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
                <RecurringRow key={payment.id} payment={payment} recurring={recurring} />
              ))}
            </div>
            <ListFoot recurring={recurring} />
          </>
        ) : (
          <NoMatches none={recurring.isEmpty} />
        )}
      </div>
    </article>
  );
};
