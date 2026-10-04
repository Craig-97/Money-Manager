import { useQuery } from '@apollo/client/react';
import { AccountDocument } from '~/graphql/generated';
import { useAuthStore } from '~/state/auth';

/*
 * The signed-in user's account. Only for pages behind RequireAccount, which has already loaded
 * it, so this reads from the cache and the account is always there.
 */
export const useAccount = () => {
  const userId = useAuthStore(s => s.session?.userId ?? '');
  const { data } = useQuery(AccountDocument, { variables: { userId }, fetchPolicy: 'cache-only' });

  if (!data?.account) throw new Error('useAccount is only for pages behind RequireAccount');
  return data.account;
};
