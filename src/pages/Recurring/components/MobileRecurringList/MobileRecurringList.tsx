import { MobileBulkBar, MobileSortButton } from '~/components/payments/PaymentControls';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { PAYMENTS_HEADING_ID, Recurring } from '../../hooks';
import { tabOptions } from '../../recurringModel';
import { ListFoot } from '../ListFoot';
import { MobileRecurringRow } from '../MobileRecurringRow';
import { NoMatches } from '../NoMatches';

/* Mobile: the payments as a list; Select turns on ticking several at once */
export const MobileRecurringList = ({ recurring }: { recurring: Recurring }) => {
  const { tab, setTab, counts, listed, sort, setSort, selection, actions } = recurring;

  return (
    <article
      aria-labelledby={PAYMENTS_HEADING_ID}
      className="flex flex-col gap-2 rounded-3xl border border-border bg-surface p-3">
      <div className="flex min-h-12 items-center justify-between pb-1 pl-2">
        <h2
          id={PAYMENTS_HEADING_ID}
          className="scroll-mt-4 text-base font-extrabold tracking-[-0.02em]">
          Payments
        </h2>
        {recurring.isEmpty ? null : (
          <div className="flex items-center">
            <MobileSortButton sort={sort} onSort={setSort} />
            <button
              type="button"
              onClick={selection.toggleSelecting}
              className="inline-flex h-11 cursor-pointer items-center rounded-full px-3 text-sm font-bold text-accent-text hover:bg-hover">
              {selection.selecting ? 'Done' : 'Select'}
            </button>
          </div>
        )}
      </div>
      <SegmentedControl
        aria-label="Show"
        value={tab}
        onValueChange={setTab}
        options={tabOptions(counts)}
        fullWidth
        className="[&>button]:h-11 [&>button]:px-1.5"
      />
      {listed.length ? (
        <>
          <div className="flex flex-col gap-0.5">
            {listed.map(payment => (
              <MobileRecurringRow key={payment.id} payment={payment} recurring={recurring} />
            ))}
          </div>
          <ListFoot recurring={recurring} compact />
        </>
      ) : (
        <NoMatches none={recurring.isEmpty} />
      )}
      {selection.selecting ? (
        <MobileBulkBar
          count={selection.selectedPayments.length}
          onPay={() => {
            void recurring.paySelected();
            selection.stopSelecting();
          }}
          onDelete={() => {
            void actions.remove(selection.selectedPayments);
            selection.stopSelecting();
          }}
        />
      ) : null}
    </article>
  );
};
