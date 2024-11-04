import { useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { logout as logoutHelper } from '~/utils/helpers/logout';
import { useAccountContext } from '~/state';

export const useLogout = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { dispatch } = useAccountContext();

  const logout = (path?: string) => {
    logoutHelper(navigate, client, dispatch, path);
  };

  return logout;
};
