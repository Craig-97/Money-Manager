import { create } from 'zustand';

interface AccountViewState {
  // The account it shows. Closing leaves it as it was, so the view keeps its contents while it
  // animates away.
  accountId: string | null;
  open: boolean;
  openFor: (accountId: string) => void;
  close: () => void;
}

/*
 * An account's view, from its name on Accounts: its balance and whether it counts, then its small
 * dialogs. A dialog on desktop, a sheet on a phone. It lives in the app shell, beside them.
 */
export const useAccountViewStore = create<AccountViewState>()(set => ({
  accountId: null,
  open: false,
  openFor: accountId => set({ accountId, open: true }),
  close: () => set({ open: false })
}));
