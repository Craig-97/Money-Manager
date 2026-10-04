import { create } from 'zustand';
import { PaymentKind } from '~/lib/payments';

export type PaymentDialogView =
  | { view: 'closed' }
  // "What kind of payment is it?"
  | { view: 'chooser' }
  | {
      view: 'form';
      kind: PaymentKind;
      // Editing this payment; adding when there's none
      paymentId?: string;
      // Opened from the chooser, so the form shows a back arrow to it
      fromChooser?: boolean;
    };

interface PaymentDialogState {
  dialog: PaymentDialogView;
  openChooser: () => void;
  openAdd: (kind: PaymentKind, fromChooser?: boolean) => void;
  openEdit: (kind: PaymentKind, paymentId: string) => void;
  close: () => void;
}

/*
 * The add and edit payment dialog, which lives in the app shell so the mobile nav's add button
 * can open it from any page.
 */
export const usePaymentDialogStore = create<PaymentDialogState>()(set => ({
  dialog: { view: 'closed' },
  openChooser: () => set({ dialog: { view: 'chooser' } }),
  openAdd: (kind, fromChooser = false) => set({ dialog: { view: 'form', kind, fromChooser } }),
  openEdit: (kind, paymentId) => set({ dialog: { view: 'form', kind, paymentId } }),
  close: () => set({ dialog: { view: 'closed' } })
}));
