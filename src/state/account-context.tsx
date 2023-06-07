import { Dispatch, ReactNode, createContext, useContext, useReducer } from 'react';
import { AccountContextState, Actions } from '~/types';
import { reducer } from './reducer';

export const initialState: AccountContextState = {
  account: {
    id: '',
    bankBalance: 0,
    bankPaydayTotal: 0,
    monthlyIncome: 0,
    bills: [],
    paymentsDue: [],
    notes: []
  },
  user: {
    id: '',
    email: '',
    firstName: '',
    surname: ''
  }
};

export const AccountContext = createContext<{
  state: AccountContextState;
  dispatch: Dispatch<Actions>;
}>({
  state: initialState,
  dispatch: () => null
});

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider = ({ children }: AccountProviderProps) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <AccountContext.Provider value={{ state, dispatch }}>{children}</AccountContext.Provider>;
};

export const useAccountContext = () => useContext(AccountContext);
