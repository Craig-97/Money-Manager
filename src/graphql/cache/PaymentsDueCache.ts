import { ApolloCache, InMemoryCache } from '@apollo/client';
import { getAccountCache, updateAccountCache } from './AccountCache';
import { OneOffPayment, User } from '~/types';
import { cheapestAscendingSort } from '~/utils';

/* Adds new one off payment to current payments due array */
export const addPaymentCache = (
  cache: ApolloCache<InMemoryCache>,
  oneOffPayment: OneOffPayment,
  user: User
) => {
  const { account } = getAccountCache(cache, user) || {};

  if (account?.oneOffPayments) {
    const oneOffPayments = [...(account.oneOffPayments || []), oneOffPayment].sort(
      cheapestAscendingSort
    );

    updateAccountCache(cache, { account: { ...account, ...{ oneOffPayments } } });
  }
};

/* Removes passed one off payment from current payments due array */
export const deletePaymentCache = (
  cache: ApolloCache<InMemoryCache>,
  oneOffPayment: OneOffPayment,
  user: User
) => {
  const { account } = getAccountCache(cache, user) || {};

  if (account?.oneOffPayments && oneOffPayment.id) {
    const oneOffPayments = account?.oneOffPayments?.filter(
      (payment: OneOffPayment) => payment.id !== oneOffPayment?.id
    );

    updateAccountCache(cache, { account: { ...account, ...{ oneOffPayments } } });
  }
};
