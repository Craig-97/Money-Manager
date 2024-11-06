import { ApolloError } from '@apollo/client';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { getGQLErrorCode, getGQLTokenExpired } from '~/utils';
import { useLogout } from './logout';
import { ERRORS } from '~/constants';

export const useErrorHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const logout = useLogout();

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

    // For soft errors, display a snackbar
    enqueueSnackbar(error.message, { variant: 'error' });
  };

  return handleGQLError;
};
