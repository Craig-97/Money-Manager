import { create } from 'zustand';
import { PaymentKind } from '~/lib/payments';

type PaymentDialogView =
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
      // Opened from Debts: a recurring payment that's always a debt, with no switch to stop it
      asDebt?: boolean;
      // Opened to update a debt's balance, so that field has focus
      focusBalance?: boolean;
    };

interface FormOptions {
  fromChooser?: boolean;
  asDebt?: boolean;
  focusBalance?: boolean;
}

interface PaymentDialogState {
  dialog: PaymentDialogView;
  openChooser: () => void;
  openAdd: (kind: PaymentKind, options?: FormOptions) => void;
  openEdit: (
    kind: PaymentKind,
    paymentId: string,
    options?: Pick<FormOptions, 'asDebt' | 'focusBalance'>
  ) => void;
  // Adding a debt: a recurring payment that's paying one off
  openAddDebt: () => void;
  close: () => void;
}

/*
 * The add and edit payment dialog, which lives in the app shell so the mobile nav's add button
 * can open it from any page.
 */
export const usePaymentDialogStore = create<PaymentDialogState>()(set => ({
  dialog: { view: 'closed' },
  openChooser: () => set({ dialog: { view: 'chooser' } }),
  openAdd: (kind, options = {}) => set({ dialog: { view: 'form', kind, ...options } }),
  openEdit: (kind, paymentId, options = {}) =>
    set({ dialog: { view: 'form', kind, paymentId, ...options } }),
  openAddDebt: () => set({ dialog: { view: 'form', kind: 'recurring', asDebt: true } }),
  close: () => set({ dialog: { view: 'closed' } })
}));
