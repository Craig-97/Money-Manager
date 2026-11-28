import { PaymentDialog } from '../PaymentDialog';
import { PaymentsDialog } from '../PaymentsDialog';
import { PaymentSheet } from '../PaymentSheet';
import { QuickEditDialog } from '../QuickEditDialog';

/*
 * A payment's form, its quick view, its small dialogs and its history, once for the whole app, so a
 * payment can be added or opened from any page
 */
export const PaymentDialogs = () => (
  <>
    <PaymentDialog />
    <PaymentSheet />
    <QuickEditDialog />
    <PaymentsDialog />
  </>
);
