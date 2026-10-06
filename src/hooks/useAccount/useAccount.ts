import { useQuery } from '@apollo/client/react';
import { AccountDocument } from '~/graphql/generated';

/*
 * The signed-in user's account, for pages behind RequireAccount. It shares the guard's request,
 * so this doesn't fetch again. `account` is null while it loads or if loading failed.
 */
export const useAccount = () => {
  const { data, error, refetch } = useQuery(AccountDocument);

  return {
    account: data?.account ?? null,
    loading: !data && !error,
    error,
    retry: () => void refetch()
  };
};

export type Account = NonNullable<ReturnType<typeof useAccount>['account']>;
