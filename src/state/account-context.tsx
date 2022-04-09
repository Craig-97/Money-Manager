import React, { createContext, useContext, useReducer } from 'react';
import { reducer } from './reducer';
import { AccountData } from '../types';

export const initialState = {
  account: {
    id: '',
    bankBalance: 0,
    bankPaydayTotal: 0,
    monthlyIncome: 0,
    bills: [],
    oneOffPayments: [],
    notes: []
  }
};

export const AccountContext = createContext<{
  state: AccountData;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null
});

interface AccountProviderProps {
  children: React.ReactNode;
}

export const AccountProvider = ({ children }: AccountProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <AccountContext.Provider value={{ state, dispatch }}>{children}</AccountContext.Provider>;
};

export const useAccountContext = () => useContext(AccountContext);
