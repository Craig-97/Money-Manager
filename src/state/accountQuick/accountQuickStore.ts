import { create } from 'zustand';

export type AccountQuickDialog = 'balance' | 'paidInto';

interface OpenOptions {
  accountId: string;
  // Opened from the account's view, so it has a back arrow to it
  fromView?: boolean;
}

interface AccountQuickState {
  // Which small dialog is open, if any
  open: AccountQuickDialog | null;
  // The account it's for. Closing leaves it as it was, so a dialog keeps its contents while it
  // animates away.
  accountId: string | undefined;
  fromView: boolean;
  // Goes up each time one opens, so each opening starts from a fresh form
  opened: number;
  openFor: (dialog: AccountQuickDialog, options: OpenOptions) => void;
  close: () => void;
}

/*
 * An account's small dialogs: a new balance, and making it where you get paid. They live in the
 * app shell, so the account's view and its menu can open them.
 */
export const useAccountQuickStore = create<AccountQuickState>()(set => ({
  open: null,
  accountId: undefined,
  fromView: false,
  opened: 0,
  openFor: (dialog, { accountId, fromView = false }) =>
    set(s => ({ open: dialog, accountId, fromView, opened: s.opened + 1 })),
  close: () => set({ open: null })
}));
