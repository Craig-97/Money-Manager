import { create } from 'zustand';

interface OpenOptions {
  // Opened from the payment's sheet on mobile, so it has a back arrow to it
  fromSheet?: boolean;
}

interface PaymentNotesState {
  // The payment whose notes it lists. Closing leaves it as it was, so the dialog keeps its
  // contents while it animates away.
  paymentId: string | null;
  fromSheet: boolean;
  open: boolean;
  openFor: (paymentId: string, options?: OpenOptions) => void;
  close: () => void;
}

/*
 * A payment's notes, opened from its note chip or menu, or its sheet on mobile. It lives in the
 * app shell, beside the note dialog it hands over to.
 */
export const usePaymentNotesStore = create<PaymentNotesState>()(set => ({
  paymentId: null,
  fromSheet: false,
  open: false,
  openFor: (paymentId, { fromSheet = false } = {}) => set({ paymentId, fromSheet, open: true }),
  close: () => set({ open: false })
}));
