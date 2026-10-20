import { create } from 'zustand';

// Edit can open straight on asking to delete, from an account's menu, or with where you get paid
// already switched on, from "Make where you get paid"
type AccountDialogView =
  | { view: 'add' }
  | { view: 'edit'; accountId: string; confirmDelete?: boolean; paidInto?: boolean };

interface AccountDialogState {
  // What it shows. Closing leaves this as it was, so the dialog keeps its contents while it
  // animates away; the next opening replaces it.
  dialog: AccountDialogView;
  open: boolean;
  // Goes up each time it opens, so each opening starts from a fresh form
  opened: number;
  openAdd: () => void;
  openEdit: (accountId: string, options?: { paidInto?: boolean }) => void;
  openDelete: (accountId: string) => void;
  close: () => void;
}

/*
 * Adding an account or changing one: a dialog on desktop and a bottom sheet on mobile. It lives
 * outside the Accounts page so a reminder that a balance is old can open it anywhere.
 */
export const useAccountDialogStore = create<AccountDialogState>()(set => ({
  dialog: { view: 'add' },
  open: false,
  opened: 0,
  openAdd: () => set(s => ({ dialog: { view: 'add' }, open: true, opened: s.opened + 1 })),
  openEdit: (accountId, { paidInto } = {}) =>
    set(s => ({
      dialog: { view: 'edit', accountId, paidInto },
      open: true,
      opened: s.opened + 1
    })),
  openDelete: accountId =>
    set(s => ({
      dialog: { view: 'edit', accountId, confirmDelete: true },
      open: true,
      opened: s.opened + 1
    })),
  close: () => set({ open: false })
}));
