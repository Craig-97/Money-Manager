import { create } from 'zustand';

type DebtDialogView =
  | { view: 'closed' }
  // Paying extra off a debt; without a debt the dialog asks which
  | { view: 'overpayment'; debtId?: string }
  // A debt's payments, newest first
  | { view: 'payments'; debtId: string };

interface DebtDialogState {
  dialog: DebtDialogView;
  openOverpayment: (debtId?: string) => void;
  openPayments: (debtId: string) => void;
  close: () => void;
}

/* The Debts pages' own dialogs: logging an overpayment and seeing a debt's payments */
export const useDebtDialogStore = create<DebtDialogState>()(set => ({
  dialog: { view: 'closed' },
  openOverpayment: debtId => set({ dialog: { view: 'overpayment', debtId } }),
  openPayments: debtId => set({ dialog: { view: 'payments', debtId } }),
  close: () => set({ dialog: { view: 'closed' } })
}));
