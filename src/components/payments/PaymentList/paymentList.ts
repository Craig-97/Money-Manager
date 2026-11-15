import { PaymentActions } from '~/hooks/usePaymentActions';
import { PaymentSelection } from '~/hooks/usePaymentSelection';

// What a page's list of payments gives the shared table and list: ticking, and acting on what's ticked
export interface PaymentList {
  selection: PaymentSelection;
  paySelected: () => Promise<unknown>;
  actions: PaymentActions;
}

/* The bulk actions, which clear what's ticked once they've started */
export const bulkActions = (list: PaymentList, { done }: { done: () => void }) => ({
  onPay: () => {
    void list.paySelected();
    done();
  },
  onDelete: () => {
    void list.actions.remove(list.selection.selectedPayments);
    done();
  }
});
