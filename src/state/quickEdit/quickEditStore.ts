import { create } from 'zustand';
import { QuickEditMode } from '~/lib/payments';

interface OpenOptions {
  mode: QuickEditMode;
  // Opened from the payment's sheet on mobile, so it has a back arrow to it
  fromSheet?: boolean;
}

interface QuickEditState {
  // The payment it changes. Closing leaves it and the mode as they were, so the dialog keeps its
  // contents while it animates away.
  paymentId: string | null;
  mode: QuickEditMode;
  fromSheet: boolean;
  open: boolean;
  // Counts each opening, so the dialog starts afresh every time
  opened: number;
  openFor: (paymentId: string, options: OpenOptions) => void;
  close: () => void;
}

/*
 * Change amount or Change date for one payment, from its row menu or its sheet on mobile. It lives
 * in the app shell, beside the sheet it can go back to.
 */
export const useQuickEditStore = create<QuickEditState>()(set => ({
  paymentId: null,
  mode: 'amount',
  fromSheet: false,
  open: false,
  opened: 0,
  openFor: (paymentId, { mode, fromSheet = false }) =>
    set(s => ({ paymentId, mode, fromSheet, open: true, opened: s.opened + 1 })),
  close: () => set({ open: false })
}));
