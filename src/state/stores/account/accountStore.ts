import { create } from 'zustand';
import { AccountState } from '~/types';

interface AccountStore {
  account: AccountState;
  setAccount: (account: AccountState) => void;
  resetAccount: () => void;
}

export const initialAccountState: AccountState = {
  id: '',
  bankBalance: 0,
  bankPaydayBalance: 0,
  monthlyIncome: 0,
  bills: [],
  paymentsDue: [],
  paydayConfig: null,
  notes: []
};

export const useAccountStore = create<AccountStore>(set => ({
  account: initialAccountState,
  setAccount: account => set({ account }),
  resetAccount: () => set({ account: initialAccountState })
}));
