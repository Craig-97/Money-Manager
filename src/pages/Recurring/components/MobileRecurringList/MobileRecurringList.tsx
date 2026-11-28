import { MobilePaymentsTile } from '~/components/payments';
import { SegmentedControl } from '~/components/ui';
import { PAYMENTS_HEADING_ID, Recurring } from '../../hooks';
import { tabOptions } from '../../recurringModel';
import { ListFoot } from '../ListFoot';
import { MobileRecurringRow } from '../MobileRecurringRow';
import { NoMatches } from '../NoMatches';

/* Mobile: the payments as a list; Select turns on ticking several at once */
export const MobileRecurringList = ({ recurring }: { recurring: Recurring }) => {
  const { tab, setTab, counts, listed, sort, setSort } = recurring;

  return (
    <MobilePaymentsTile
      headingId={PAYMENTS_HEADING_ID}
      list={recurring}
      isEmpty={recurring.isEmpty}
      sort={sort}
      onSort={setSort}
      tabs={
        <SegmentedControl
          aria-label="Show"
          value={tab}
          onValueChange={setTab}
          options={tabOptions(counts)}
          fullWidth
          className="[&>button]:h-11 [&>button]:px-1.5"
        />
      }>
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
    </MobilePaymentsTile>
  );
};
