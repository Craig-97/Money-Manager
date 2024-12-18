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
    paydayConfig: undefined,
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
  account: AccountContextState['account'];
  user: AccountContextState['user'];
  dispatch: Dispatch<Actions>;
}>({
  account: initialState.account,
  user: initialState.user,
  dispatch: () => null
});

interface AccountProviderProps {
  children: ReactNode;
}

export const AccountProvider = ({ children }: AccountProviderProps) => {
  const [{ account, user }, dispatch] = useReducer(reducer, initialState);

  return (
    <AccountContext.Provider value={{ account, user, dispatch }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
