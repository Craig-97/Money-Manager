import { useNavigate } from 'react-router-dom';
import { ApolloError } from '@apollo/client';
import { useLogout } from './useLogout';
import { ERRORS } from '~/constants';
import { useSafeSnackbar } from '~/hooks';
import { getGQLErrorCode, getGQLTokenExpired } from '~/utils';

export const useErrorHandler = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const enqueueSnackbar = useSafeSnackbar();

  const handleGQLError = (error: ApolloError) => {
    // Ignore account not found error as this is used to navigate to setup page
    const errorCode = getGQLErrorCode(error);
    if (errorCode === ERRORS.ACCOUNT_NOT_LINKED) return;

    if (getGQLTokenExpired(error)) {
      logout('/session-expired');
      return;
    }

    // Clear token if user not found in case of account deletion
    if (errorCode === ERRORS.USER_NOT_FOUND) {
      localStorage.removeItem('token');
    }

    if (error.networkError || errorCode === ERRORS.USER_NOT_FOUND) {
      navigate('/error', { state: { error } });
      return;
    }

    // For soft errors, display a snackbar if available
    if (enqueueSnackbar) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  return handleGQLError;
};
