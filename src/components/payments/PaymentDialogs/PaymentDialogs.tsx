import { PaymentDialog } from '../PaymentDialog';
import { PaymentSheet } from '../PaymentSheet';
import { QuickEditDialog } from '../QuickEditDialog';

/*
 * A payment's form, its quick view and its small dialogs, once for the whole app, so a payment can
 * be added or opened from any page
 */
export const PaymentDialogs = () => (
  <>
    <PaymentDialog />
    <PaymentSheet />
    <QuickEditDialog />
  </>
);
