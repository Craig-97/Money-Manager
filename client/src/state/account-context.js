import React, { createContext, useContext, useReducer } from 'react';
import { reducer } from './reducer';

export const AccountContext = createContext();
export const AccountProvider = ({ children, initialState }) => (
  <AccountContext.Provider value={useReducer(reducer, initialState)}>
    {children}
  </AccountContext.Provider>
);
export const useAccountContext = () => useContext(AccountContext);