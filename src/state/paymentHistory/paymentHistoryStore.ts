import { create } from 'zustand';

// The view it was opened from, which its back arrow returns to: a debt's, or a payment's
type BackTo = 'debt' | 'payment' | null;

interface PaymentHistoryState {
  // The recurring payment it shows. Closing leaves it as it was, so the dialog keeps its contents
  // while it animates away.
  paymentId: string | null;
  open: boolean;
  backTo: BackTo;
  openFor: (paymentId: string, options?: { backTo?: BackTo }) => void;
  close: () => void;
}

/*
 * A recurring payment's history, debts' included: See payments from its view or its menu. It lives
 * in the app shell, so any page's payment can open it.
 */
export const usePaymentHistoryStore = create<PaymentHistoryState>()(set => ({
  paymentId: null,
  open: false,
  backTo: null,
  openFor: (paymentId, { backTo = null } = {}) => set({ paymentId, open: true, backTo }),
  close: () => set({ open: false })
}));
