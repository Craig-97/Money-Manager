import { useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { EVENTS } from '~/constants';
import { useAccountStore, useUserContext } from '~/state';

export const useLogout = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { dispatch } = useUserContext();
  const { resetAccount } = useAccountStore();

  const logout = (redirectPath?: string) => {
    // Remove login token
    localStorage.removeItem('token');

    // Custom navigation path or default to /login
    const path = redirectPath ?? '/login';

    // Navigate to login page
    navigate(path);

    // Clears React Context
    dispatch({ type: EVENTS.LOGOUT });

    // Reset account state
    resetAccount();

    // Clear Apollo Cache without triggering refetches
    client.clearStore();
  };

  return logout;
};
