import { create } from 'zustand';

interface DebtDialogState {
  // Which dialog is open, if any
  open: 'overpayment' | 'payments' | 'paySooner' | null;
  // What each one shows. Closing leaves these as they were, so a dialog keeps its contents while it
  // animates away, even when another one is opening from it.
  // Paying extra off this debt; without one the dialog asks which
  overpaymentDebtId: string | undefined;
  // This debt's payments, newest first
  paymentsDebtId: string | undefined;
  // Trying some extra a month on this debt
  paySoonerDebtId: string | undefined;
  // Goes up each time one opens, so each opening starts from a fresh form
  opened: number;
  openOverpayment: (debtId?: string) => void;
  openPayments: (debtId: string) => void;
  openPaySooner: (debtId: string) => void;
  close: () => void;
}

/*
 * The Debts pages' own dialogs: logging an overpayment, seeing a debt's payments and paying one
 * off sooner
 */
export const useDebtDialogStore = create<DebtDialogState>()(set => ({
  open: null,
  overpaymentDebtId: undefined,
  paymentsDebtId: undefined,
  paySoonerDebtId: undefined,
  opened: 0,
  openOverpayment: debtId =>
    set(s => ({ open: 'overpayment', overpaymentDebtId: debtId, opened: s.opened + 1 })),
  openPayments: debtId =>
    set(s => ({ open: 'payments', paymentsDebtId: debtId, opened: s.opened + 1 })),
  openPaySooner: debtId =>
    set(s => ({ open: 'paySooner', paySoonerDebtId: debtId, opened: s.opened + 1 })),
  close: () => set({ open: null })
}));
