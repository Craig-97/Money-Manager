import { MobileBulkBar as BulkBar } from '~/components/payments/PaymentControls';
import { Dashboard } from '../../../hooks';

/* Mobile select mode: sits over the bottom nav with the bulk actions */
export const MobileBulkBar = ({ dashboard }: { dashboard: Dashboard }) => {
  const { selection, actions } = dashboard;
  if (!selection.selecting) return null;
  return (
    <BulkBar
      count={selection.selectedPayments.length}
      onPay={() => {
        void dashboard.paySelected();
        selection.stopSelecting();
      }}
      onDelete={() => {
        void actions.remove(selection.selectedPayments);
        selection.stopSelecting();
      }}
    />
  );
};
