import { PaymentsTile, PaymentTableHead } from '~/components/payments';
import { SegmentedControl } from '~/components/ui';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { PAYMENTS_HEADING_ID, Recurring } from '../../hooks';
import { tabOptions } from '../../recurringModel';
import { ListFoot } from '../ListFoot';
import { NoMatches } from '../NoMatches';
import { PaymentFilters } from '../PaymentFilters';
import { RecurringRow, rowClasses } from '../RecurringRow';

/* Desktop: every recurring payment, with tabs, search, category, sorting and bulk actions */
export const RecurringTable = ({ recurring }: { recurring: Recurring }) => {
  const { tab, setTab, counts, listed, sort, setSort } = recurring;
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <PaymentsTile
      headingId={PAYMENTS_HEADING_ID}
      tabs={
        <SegmentedControl
          aria-label="Payment lists"
          value={tab}
          onValueChange={setTab}
          options={tabOptions(counts)}
        />
      }
      onAdd={() => openAdd('recurring')}
      addLabel="Add recurring payment"
      sort={sort}
      onSort={setSort}>
      {recurring.isEmpty ? null : <PaymentFilters recurring={recurring} />}

      <div role="table" aria-label="Recurring payments">
        {listed.length || recurring.selection.selectedPayments.length ? (
          <PaymentTableHead id="recurring-select-all" list={recurring} rowClassName={rowClasses}>
            <span role="columnheader" className="hidden min-[82.5625rem]:block">
              Frequency
            </span>
            <span role="columnheader">Next due</span>
            <span role="columnheader" className="hidden wide:block">
              {tab === 'cycle' ? 'Status' : 'Renews or ends'}
            </span>
          </PaymentTableHead>
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
    </PaymentsTile>
  );
};
