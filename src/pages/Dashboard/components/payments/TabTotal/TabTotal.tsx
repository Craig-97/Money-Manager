import { ListTotal } from '~/components/payments/PaymentParts';
import { Dashboard } from '../../../hooks';

/*
 * The tab's total. On the recurring tab it's a monthly figure, "≈" when weekly or fortnightly
 * payments count at their average, with quarterly and yearly payments as a yearly figure under it.
 */
export const TabTotal = ({
  dashboard,
  compact = false
}: {
  dashboard: Dashboard;
  compact?: boolean;
}) => {
  const { tab, listedNet, summary } = dashboard;
  const recurring = tab === 'recurring';
  return (
    <ListTotal
      net={listedNet}
      perMonth={recurring}
      approx={recurring && summary.averagedRecurring.length > 0}
      annual={recurring ? summary.annualRecurring : 0}
      compact={compact}
    />
  );
};
