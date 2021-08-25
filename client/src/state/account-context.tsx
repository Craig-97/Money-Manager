import React, { createContext, useContext, useReducer } from 'react';
import { reducer } from './reducer';
import { AccountData } from '../interfaces';

const initialState = {
  account: {}
};

export const AccountContext = createContext<{
  state: AccountData;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null
});

export const AccountProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <AccountContext.Provider value={{ state, dispatch }}>
      {children}
    </AccountContext.Provider>
  );
};

export const useAccountContext = () => useContext(AccountContext);
