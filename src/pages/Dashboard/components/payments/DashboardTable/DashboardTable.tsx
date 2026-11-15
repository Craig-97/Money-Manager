import { PaymentListFoot, PaymentsTile, PaymentTableHead } from '~/components/payments';
import { SegmentedControl } from '~/components/ui';
import { formatShortDate } from '~/lib/dates';
import { PaymentTab, tabOptions } from '../../../dashboardModel';
import { Dashboard } from '../../../hooks';
import { DashboardRow } from '../DashboardRow';
import { EmptyPayments } from '../EmptyPayments';
import { footLabel } from '../paymentText';
import { rowClasses } from '../rowClasses';
import { TabTotal } from '../TabTotal';
import { useAddForTab } from '../useAddForTab';

const HEADINGS: Record<PaymentTab, [string, string, string]> = {
  upcoming: ['Type', 'Category', 'Due'],
  recurring: ['Frequency', 'Next due', 'Status'],
  oneOff: ['Type', 'Category', 'Date']
};

/* Desktop: the payments in a table, with tabs, sorting and bulk actions */
export const DashboardTable = ({ dashboard }: { dashboard: Dashboard }) => {
  const { tab, setTab, listed, sort, setSort, cycle, today } = dashboard;
  const add = useAddForTab(tab);
  const [typeHeading, middleHeading, lastHeading] = HEADINGS[tab];

  return (
    <PaymentsTile
      headingId="payments-title"
      tabs={
        <SegmentedControl
          aria-label="Payment lists"
          value={tab}
          onValueChange={setTab}
          options={tabOptions(dashboard.payments, { cycle })}
        />
      }
      onAdd={add}
      sort={sort}
      onSort={setSort}
      className="col-span-full">
      <div role="table" aria-label="Payments">
        {listed.length || dashboard.selection.selectedPayments.length ? (
          <PaymentTableHead id={`select-all-${tab}`} list={dashboard} rowClassName={rowClasses}>
            <span role="columnheader">{typeHeading}</span>
            <span role="columnheader" className="hidden wide:block">
              {middleHeading}
            </span>
            <span role="columnheader">{lastHeading}</span>
          </PaymentTableHead>
        ) : null}

        {listed.length ? (
          <>
            <div className="flex flex-col gap-0.5 border-t border-border pt-1.5">
              {listed.map(payment => (
                <DashboardRow key={payment.id} payment={payment} dashboard={dashboard} />
              ))}
            </div>
            <PaymentListFoot
              label={footLabel(listed.length, { tab, payday: formatShortDate(cycle.end, today) })}>
              <TabTotal dashboard={dashboard} />
            </PaymentListFoot>
          </>
        ) : (
          <EmptyPayments tab={tab} onAdd={add} />
        )}
      </div>
    </PaymentsTile>
  );
};
