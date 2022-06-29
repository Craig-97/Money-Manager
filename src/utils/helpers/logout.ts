import { ApolloClient } from '@apollo/client';
import { NavigateFunction } from 'react-router-dom';
import { EVENTS } from '../../constants';

// Logout the current user, redirect them to the login page and clear the apollo store
export const logout = (
  navigate: NavigateFunction | undefined,
  client: ApolloClient<object>,
  dispatch: React.Dispatch<any>
) => {
  // Removes login token
  localStorage.removeItem('token');

  // Navigates to login page
  navigate ? navigate('/login') : (window.location.pathname = '/login');

  // Clears React Context
  dispatch({ type: EVENTS.LOGOUT });

  // Clears Apollo Cache
  client.resetStore();
};
