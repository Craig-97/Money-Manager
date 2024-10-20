import { ApolloError } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useApolloClient } from '@apollo/client';
import { useAccountContext } from '../state/account-context';
import { getGQLTokenExpired, logout } from '~/utils';

export const useErrorHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const client = useApolloClient();
  const { dispatch } = useAccountContext();

  const handleGQLError = (error: ApolloError) => {
    if (getGQLTokenExpired(error)) {
      logout(navigate, client, dispatch, '/session-expired');
      return;
    }

    if (error.networkError) {
      navigate('/error', { state: { error } });
      return;
    }

    // For soft errors, display a snackbar
    enqueueSnackbar(error.message, { variant: 'error' });
  };

  return handleGQLError;
};
