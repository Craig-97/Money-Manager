import { skipToken, useQuery } from '@apollo/client/react';
import { ERRORS } from '~/constants';
import { AccountStatusDocument } from '~/graphql/generated';
import { hasErrorCode } from '~/lib/errors';
import { useAuthStore } from '~/state/auth';

export type AccountStatus = 'loading' | 'ready' | 'missing' | 'error';

/* Whether the signed-in user has an account yet, i.e. has finished setup */
export const useAccountStatus = () => {
  const userId = useAuthStore(state => state.session?.userId);
  const { data, error, refetch } = useQuery(
    AccountStatusDocument,
    userId ? { variables: { userId } } : skipToken
  );

  const getStatus = (): AccountStatus => {
    if (hasErrorCode(error, ERRORS.ACCOUNT_NOT_LINKED)) return 'missing';
    if (error) return 'error';
    if (!data) return 'loading';
    return data.account ? 'ready' : 'missing';
  };

  return { status: getStatus(), error, refetch };
};
