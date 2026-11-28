import { MobilePaymentsTile, PaymentListFoot } from '~/components/payments';
import { SegmentedControl } from '~/components/ui';
import { formatShortDate } from '~/lib/dates';
import { tabOptions } from '../../../dashboardModel';
import { Dashboard } from '../../../hooks';
import { EmptyPayments } from '../EmptyPayments';
import { MobileDashboardRow } from '../MobileDashboardRow';
import { footLabel } from '../paymentText';
import { TabTotal } from '../TabTotal';
import { useAddForTab } from '../useAddForTab';

/* Mobile: the payments as a list; Select turns on ticking several at once */
export const MobileDashboardList = ({ dashboard }: { dashboard: Dashboard }) => {
  const { tab, setTab, listed, sort, setSort, cycle, today } = dashboard;
  const add = useAddForTab(tab);

  return (
    <MobilePaymentsTile
      headingId="payments-title-mobile"
      tour="payments"
      list={dashboard}
      isEmpty={dashboard.isEmpty}
      sort={sort}
      onSort={setSort}
      tabs={
        <SegmentedControl
          aria-label="Payment lists"
          value={tab}
          onValueChange={setTab}
          options={tabOptions(dashboard.payments, { cycle })}
          fullWidth
          className="[&>button]:h-11 [&>button]:px-1.5"
        />
      }>
      {listed.length ? (
        <>
          <div className="flex flex-col gap-0.5">
            {listed.map(payment => (
              <MobileDashboardRow key={payment.id} payment={payment} dashboard={dashboard} />
            ))}
          </div>
          <PaymentListFoot
            label={footLabel(listed.length, { tab, payday: formatShortDate(cycle.end, today) })}
            compact>
            <TabTotal dashboard={dashboard} compact />
          </PaymentListFoot>
        </>
      ) : (
        <EmptyPayments tab={tab} onAdd={add} />
      )}
    </MobilePaymentsTile>
  );
};
