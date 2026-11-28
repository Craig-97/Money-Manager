import { create } from 'zustand';
import { AccountKind } from '~/graphql/generated';

// Adding starts with what kind of account it is. Edit can open straight on asking to delete, from
// an account's menu, or with where you get paid already switched on, from "Make where you get paid".
type AccountDialogView =
  | { view: 'chooser' }
  | { view: 'add'; kind: AccountKind }
  | { view: 'edit'; accountId: string; confirmDelete?: boolean; paidInto?: boolean };

interface AccountDialogState {
  // What it shows. Closing leaves this as it was, so the dialog keeps its contents while it
  // animates away; the next opening replaces it.
  dialog: AccountDialogView;
  open: boolean;
  // Goes up each time it opens, so each opening starts from a fresh form
  opened: number;
  openAdd: () => void;
  // From the chooser: the form for that kind, with a back arrow to the chooser
  chooseKind: (kind: AccountKind) => void;
  backToChooser: () => void;
  openEdit: (accountId: string, options?: { paidInto?: boolean }) => void;
  openDelete: (accountId: string) => void;
  close: () => void;
}

/*
 * Adding an account or changing one: a dialog on desktop and a bottom sheet on mobile. It lives
 * outside the Accounts page so a reminder that a balance is old can open it anywhere.
 */
export const useAccountDialogStore = create<AccountDialogState>()(set => ({
  dialog: { view: 'chooser' },
  open: false,
  opened: 0,
  openAdd: () => set(s => ({ dialog: { view: 'chooser' }, open: true, opened: s.opened + 1 })),
  chooseKind: kind => set(s => ({ dialog: { view: 'add', kind }, opened: s.opened + 1 })),
  backToChooser: () => set({ dialog: { view: 'chooser' } }),
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
