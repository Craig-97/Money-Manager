import { ApolloClient } from '@apollo/client';
import { Dispatch } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { EVENTS } from '~/constants';
import { Actions } from '~/types';

// Logout the current user, redirect them to the login page and clear the apollo store
export const logout = (
  navigate: NavigateFunction | undefined,
  client: ApolloClient<object>,
  dispatch: Dispatch<Actions>,
  redirectPath?: string
) => {
  // Remove login token
  localStorage.removeItem('token');

  // Custom navigation path or default to /login
  const path = redirectPath ? redirectPath : '/login';

  // Navigate to login page
  navigate ? navigate(path) : (window.location.pathname = path);

  // Clears React Context
  dispatch({ type: EVENTS.LOGOUT });

  // Clear Apollo Cache without triggering refetches
  client.clearStore();
};
