import { ApolloError } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { getGQLTokenExpired } from '~/utils';
import { useLogout } from './logout';
import { ERRORS } from '~/constants';

export const useErrorHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const logout = useLogout();

  const handleGQLError = (error: ApolloError) => {
    // Ignore account not found error as this is used to navigate to setup page
    if (error?.message === ERRORS.ACCOUNT_NOT_FOUND) return;

    if (getGQLTokenExpired(error)) {
      logout('/session-expired');
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
