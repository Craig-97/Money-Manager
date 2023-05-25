import { ApolloCache } from '@apollo/client';
import { Bill, User } from '~/types';
import { cheapestAscendingSort } from '~/utils';
import { getAccountCache, updateAccountCache } from './AccountCache';

/* Adds new bill to current bill array */
export const addBillCache = (cache: ApolloCache<any>, bill: Bill, user: User) => {
  const { account } = getAccountCache(cache, user) || {};

  if (account?.bills) {
    const bills = [...(account.bills || []), bill].sort(cheapestAscendingSort);
    updateAccountCache(cache, { account: { ...account, ...{ bills } } });
  }
};

/* Removes bill from current bills array */
export const deleteBillCache = (cache: ApolloCache<any>, bill: Bill, user: User) => {
  const { account } = getAccountCache(cache, user) || {};

  if (account?.bills && bill.id) {
    const bills = account?.bills?.filter((b: Bill) => b.id !== bill.id);
    updateAccountCache(cache, { account: { ...account, ...{ bills } } });
  }
};
