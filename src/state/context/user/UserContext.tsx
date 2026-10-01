import { Dispatch, ReactNode } from 'react';
import { createContext, useContext, useReducer } from 'react';
import { reducer } from './reducer';
import { User, Actions } from '~/types';

export const initialUserState: User = {
  id: '',
  email: '',
  firstName: '',
  surname: ''
};

export const UserContext = createContext<{
  user: User;
  dispatch: Dispatch<Actions>;
}>({
  user: initialUserState,
  dispatch: () => null
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [user, dispatch] = useReducer(reducer, initialUserState);

  return <UserContext.Provider value={{ user, dispatch }}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);
