import { create } from 'zustand';

interface SetupAccountsState {
  open: boolean;
  // Goes up each time it opens, so each opening starts from the payments as they are
  opened: number;
  openSetup: () => void;
  close: () => void;
}

/*
 * "Set up your accounts": where pay lands, and which account each payment goes out of. It opens
 * once a second account to spend from is added, and from the reminder that some payments don't
 * say.
 */
export const useSetupAccountsStore = create<SetupAccountsState>()(set => ({
  open: false,
  opened: 0,
  openSetup: () => set(s => ({ open: true, opened: s.opened + 1 })),
  close: () => set({ open: false })
}));
