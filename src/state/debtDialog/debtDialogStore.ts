import { create } from 'zustand';

interface OpenOptions {
  // Opened from the debt's view, so it has a back arrow to it
  fromView?: boolean;
}

interface DebtDialogState {
  // Which dialog is open, if any
  open: 'balance' | 'overpayment' | 'payments' | 'paySooner' | null;
  // What each one shows. Closing leaves these as they were, so a dialog keeps its contents while it
  // animates away, even when another one is opening from it.
  // A new balance for this debt, from a statement
  balanceDebtId: string | undefined;
  // Paying extra off this debt; without one the dialog asks which
  overpaymentDebtId: string | undefined;
  // This debt's payments, newest first
  paymentsDebtId: string | undefined;
  // Trying some extra a month on this debt
  paySoonerDebtId: string | undefined;
  fromView: boolean;
  // Goes up each time one opens, so each opening starts from a fresh form
  opened: number;
  openBalance: (debtId: string, options?: OpenOptions) => void;
  openOverpayment: (debtId?: string, options?: OpenOptions) => void;
  openPayments: (debtId: string, options?: OpenOptions) => void;
  openPaySooner: (debtId: string, options?: OpenOptions) => void;
  close: () => void;
}

/*
 * A debt's small dialogs: a new balance, logging an overpayment, seeing its payments and paying it
 * off sooner. They live in the app shell, so the debt's view can open them from any page.
 */
export const useDebtDialogStore = create<DebtDialogState>()(set => ({
  open: null,
  balanceDebtId: undefined,
  overpaymentDebtId: undefined,
  paymentsDebtId: undefined,
  paySoonerDebtId: undefined,
  fromView: false,
  opened: 0,
  openBalance: (debtId, { fromView = false } = {}) =>
    set(s => ({ open: 'balance', balanceDebtId: debtId, fromView, opened: s.opened + 1 })),
  openOverpayment: (debtId, { fromView = false } = {}) =>
    set(s => ({ open: 'overpayment', overpaymentDebtId: debtId, fromView, opened: s.opened + 1 })),
  openPayments: (debtId, { fromView = false } = {}) =>
    set(s => ({ open: 'payments', paymentsDebtId: debtId, fromView, opened: s.opened + 1 })),
  openPaySooner: (debtId, { fromView = false } = {}) =>
    set(s => ({ open: 'paySooner', paySoonerDebtId: debtId, fromView, opened: s.opened + 1 })),
  close: () => set({ open: null })
}));
