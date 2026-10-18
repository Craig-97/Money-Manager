import { create } from 'zustand';

interface DebtDialogState {
  // Which dialog is open, if either
  open: 'overpayment' | 'payments' | null;
  // What each one shows. Closing leaves these as they were, so a dialog keeps its contents while it
  // animates away, even when the other one is opening from it.
  // Paying extra off this debt; without one the dialog asks which
  overpaymentDebtId: string | undefined;
  // This debt's payments, newest first
  paymentsDebtId: string | undefined;
  // Goes up each time one opens, so each opening starts from a fresh form
  opened: number;
  openOverpayment: (debtId?: string) => void;
  openPayments: (debtId: string) => void;
  close: () => void;
}

/* The Debts pages' own dialogs: logging an overpayment and seeing a debt's payments */
export const useDebtDialogStore = create<DebtDialogState>()(set => ({
  open: null,
  overpaymentDebtId: undefined,
  paymentsDebtId: undefined,
  opened: 0,
  openOverpayment: debtId =>
    set(s => ({ open: 'overpayment', overpaymentDebtId: debtId, opened: s.opened + 1 })),
  openPayments: debtId =>
    set(s => ({ open: 'payments', paymentsDebtId: debtId, opened: s.opened + 1 })),
  close: () => set({ open: null })
}));
