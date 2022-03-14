import { getAccountData } from './../../mockData';
import { ApolloCache } from '@apollo/client';
import { Account, AccountData, Bill, OneOffPayment } from '../../interfaces';
import { getBillDeleted, getOneOffPaymentDeleted } from '../../utils';
import { GET_ACCOUNT_QUERY } from '../queries';

/* DELETES ONE OFF PAYMENT FROM ONEOFFPAYMENTS ARRAY */
export const deletePaymentCache = (cache: ApolloCache<any>, oneOffPayment: OneOffPayment) => {
  const data: AccountData | null = cache.readQuery({
    query: GET_ACCOUNT_QUERY
  });

  if (data && oneOffPayment?.id) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: getOneOffPaymentDeleted(data?.account, oneOffPayment.id)
    });
  }
};

/* DELETES BILL FROM BILLS ARRAY */
export const deleteBillCache = (cache: ApolloCache<any>, bill: Bill) => {
  const data: AccountData | null = cache.readQuery({
    query: GET_ACCOUNT_QUERY
  });

  if (data && bill?.id) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: getBillDeleted(data?.account, bill.id)
    });
  }
};

/* TAKES IN UPDATED ACCOUNT FIELDS AND REFORMATS ALL ACCOUNT DATA */
export const editAccountCache = (cache: ApolloCache<any>, account: Account) => {
  const data: AccountData | null = cache.readQuery({
    query: GET_ACCOUNT_QUERY
  });

  const updatedAccount = { ...data?.account, ...account };
  const accountData = getAccountData(updatedAccount);

  if (accountData) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: { account: accountData }
    });
  }
};
