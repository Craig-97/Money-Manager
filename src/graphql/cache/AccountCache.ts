import { ApolloCache, InMemoryCache } from '@apollo/client';
import { GET_ACCOUNT_QUERY } from '../queries';
import { Account, AccountData, User } from '~/types';

/* Returns account query cached data */
export const getAccountCache = (
  cache: ApolloCache<InMemoryCache>,
  user: User
): AccountData | null =>
  cache.readQuery({
    query: GET_ACCOUNT_QUERY,
    variables: { id: user.id }
  });

/* Updates account query cached data */
export const updateAccountCache = (cache: ApolloCache<InMemoryCache>, data: AccountData) =>
  cache.writeQuery({
    query: GET_ACCOUNT_QUERY,
    data
  });

/* Updates account query cache by merging passed account data with current cached data */
export const editAccountCache = (
  cache: ApolloCache<InMemoryCache>,
  account: Account,
  user: User
) => {
  const data = getAccountCache(cache, user);

  // Handles when a new account is setup and no existing account data is cached
  const accountData = data?.account ? { ...data.account, ...account } : account;

  if (accountData) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: { account: accountData }
    });
  }
};
