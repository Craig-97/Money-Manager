import { create } from 'zustand';

interface DebtViewState {
  // The debt it shows. Closing leaves it as it was, so the view keeps its contents while it
  // animates away.
  debtId: string | null;
  open: boolean;
  openFor: (debtId: string) => void;
  close: () => void;
}

/*
 * A debt's view, from its name on Debts or View debt on a payment: what's left, then its small
 * dialogs. A dialog on desktop, a sheet on a phone. It lives in the app shell, beside them.
 */
export const useDebtViewStore = create<DebtViewState>()(set => ({
  debtId: null,
  open: false,
  openFor: debtId => set({ debtId, open: true }),
  close: () => set({ open: false })
}));
