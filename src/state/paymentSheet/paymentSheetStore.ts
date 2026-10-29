import { create } from 'zustand';

interface PaymentSheetState {
  // The payment it's about. Closing leaves it as it was, so the sheet keeps its contents while it
  // slides away.
  paymentId: string | null;
  open: boolean;
  openFor: (paymentId: string) => void;
  close: () => void;
}

/*
 * The short sheet a payment opens on mobile: the things people do most, with Edit payment for the
 * rest. It lives in the app shell so the notes it opens can come back to it.
 */
export const usePaymentSheetStore = create<PaymentSheetState>()(set => ({
  paymentId: null,
  open: false,
  openFor: paymentId => set({ paymentId, open: true }),
  close: () => set({ open: false })
}));
