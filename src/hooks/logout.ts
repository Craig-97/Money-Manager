import { useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { useAccountContext } from '~/state';
import { logout as logoutHelper } from '~/utils';

export const useLogout = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { dispatch } = useAccountContext();

  const logout = (path?: string) => {
    logoutHelper(navigate, client, dispatch, path);
  };

  return logout;
};
