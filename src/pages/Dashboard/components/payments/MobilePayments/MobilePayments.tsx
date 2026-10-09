import { MobileSortButton } from '~/components/payments/PaymentControls';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { formatShortDate } from '~/lib/payments';
import { Dashboard } from '../../../hooks';
import { EmptyPayments } from '../EmptyPayments';
import { MobileRow } from '../MobileRow';
import { footLabel } from '../paymentText';
import { tabOptions } from '../tabOptions';
import { TabTotal } from '../TabTotal';
import { useAddForTab } from '../useAddForTab';

/* Mobile: the payments as a list; Select turns on ticking several at once */
export const MobilePayments = ({ dashboard }: { dashboard: Dashboard }) => {
  const { tab, setTab, listed, sort, setSort, cycle, selection } = dashboard;
  const add = useAddForTab(tab);

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
            <TabTotal dashboard={dashboard} compact />
          </div>
        </>
      ) : (
        <EmptyPayments tab={tab} onAdd={add} />
      )}
    </article>
  );
};
