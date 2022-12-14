import React, { createContext, useContext, useReducer } from 'react';
import { Account, User } from '~/types';
import { reducer } from './reducer';

export const initialState = {
  account: {
    id: '',
    bankBalance: 0,
    bankPaydayTotal: 0,
    monthlyIncome: 0,
    bills: [],
    oneOffPayments: [],
    notes: []
  },
  user: {
    id: '',
    email: '',
    firstName: '',
    surname: ''
  }
};

interface AccountContextType {
  account: Account;
  user: User;
}

export const AccountContext = createContext<{
  state: AccountContextType;
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
