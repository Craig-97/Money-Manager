import { useNavigate } from 'react-router-dom';
import { CombinedGraphQLErrors } from '@apollo/client';
import { useLogout } from './useLogout';
import { ERRORS } from '~/constants';
import { useSafeSnackbar } from '~/hooks';
import { getGQLErrorCode, getGQLTokenExpired } from '~/utils';

export const useErrorHandler = () => {
  const navigate = useNavigate();
  const logout = useLogout();
  const enqueueSnackbar = useSafeSnackbar();

  const handleGQLError = (error: unknown) => {
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

    // Detect network errors (v4-safe approach)
    const isNetworkError = error instanceof Error && !CombinedGraphQLErrors.is(error);

    if (isNetworkError || errorCode === ERRORS.USER_NOT_FOUND) {
      navigate('/error', { state: { error } });
      return;
    }

    // For soft errors, display a snackbar if available
    if (enqueueSnackbar) {
      const message = error instanceof Error ? error.message : 'Something went wrong';

      enqueueSnackbar(message, { variant: 'error' });
    }
  };

  return handleGQLError;
};
