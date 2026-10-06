import { skipToken, useQuery } from '@apollo/client/react';
import { ERRORS } from '~/constants';
import { AccountDocument } from '~/graphql/generated';
import { hasErrorCode } from '~/lib/errors';
import { useAuthStore } from '~/state/auth';

export type AccountStatus = 'loading' | 'ready' | 'missing' | 'error';

/*
 * Whether the signed-in user has an account yet, i.e. has finished setup. It loads the whole
 * account, so the pages behind the guard have their data as soon as it's ready.
 */
export const useAccountStatus = () => {
  // The API finds the account from the token, so this only waits for a session
  const signedIn = useAuthStore(s => Boolean(s.session));
  const { data, error, refetch } = useQuery(AccountDocument, signedIn ? {} : skipToken);

  const getStatus = (): AccountStatus => {
    if (hasErrorCode(error, ERRORS.ACCOUNT_NOT_LINKED)) return 'missing';
    if (error) return 'error';
    if (!data) return 'loading';
    return data.account ? 'ready' : 'missing';
  };

  return { status: getStatus(), error, refetch };
};
