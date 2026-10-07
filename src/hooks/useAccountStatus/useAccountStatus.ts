import { useCurrentUser } from '../useCurrentUser';

export type AccountStatus = 'loading' | 'ready' | 'missing' | 'error';

/*
 * Whether the signed-in user has an account yet, i.e. has finished setup. Every session starts with
 * the user in the cache, so this is known straight away rather than waiting on the account.
 */
export const useAccountStatus = () => {
  const { user, error, refetch } = useCurrentUser();

  const getStatus = (): AccountStatus => {
    if (user) return user.account ? 'ready' : 'missing';
    return error ? 'error' : 'loading';
  };

  return { status: getStatus(), retry: () => void refetch() };
};
