import { ApolloCache } from '@apollo/client';
import { AccountDocument, AccountFieldsFragment } from '~/graphql/generated';

/*
 * Links a new account to the signed-in user, which takes them out of setup: the route guards read
 * the user's account. The account is stored as their default one too, so the dashboard opens with
 * it already loaded.
 */
export const linkAccount = (cache: ApolloCache, userId: string, account: AccountFieldsFragment) => {
  cache.writeQuery({ query: AccountDocument, data: { account } });
  cache.modify({
    id: cache.identify({ __typename: 'User', id: userId }),
    fields: { account: () => account.id }
  });
};
