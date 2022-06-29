import { ApolloClient } from '@apollo/client';
import { NavigateFunction } from 'react-router-dom';

// Logout the current user, redirect them to the login page and clear the apollo store
export const logout = (navigate: NavigateFunction | undefined, client: ApolloClient<object>) => {
  localStorage.removeItem('token');
  navigate ? navigate('/login') : (window.location.pathname = '/login');
  client.clearStore();
};
