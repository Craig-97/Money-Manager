import { ApolloCache } from '@apollo/client';
import { Account, AccountData, Bill, Note, OneOffPayment } from '../../types';
import {
  getBillDeleted,
  getNewBillAdded,
  getNewNoteAdded,
  getNewOneOffPaymentAdded,
  getNoteDeleted,
  getOneOffPaymentDeleted
} from '../../utils';
import { GET_ACCOUNT_QUERY } from '../queries';

/* ADDS ONE OFF PAYMENT TO ONEOFFPAYMENTS ARRAY */
export const addPaymentCache = (cache: ApolloCache<any>, oneOffPayment: OneOffPayment) => {
  const data: AccountData | null = cache.readQuery({
    query: GET_ACCOUNT_QUERY
  });

  if (data) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: getNewOneOffPaymentAdded(data?.account, oneOffPayment)
    });
  }
};

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

/* ADDS BILL TO BILLS ARRAY */
export const addBillCache = (cache: ApolloCache<any>, bill: Bill) => {
  const data: AccountData | null = cache.readQuery({
    query: GET_ACCOUNT_QUERY
  });

  if (data) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: getNewBillAdded(data?.account, bill)
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

/* ADDS NOTE TO NOTES ARRAY */
export const addNoteCache = (cache: ApolloCache<any>, note: Note) => {
  const data: AccountData | null = cache.readQuery({
    query: GET_ACCOUNT_QUERY
  });

  if (data) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: getNewNoteAdded(data?.account, note)
    });
  }
};

/* DELETES NOTE FROM NOTES ARRAY */
export const deleteNoteCache = (cache: ApolloCache<any>, note: Note) => {
  const data: AccountData | null = cache.readQuery({
    query: GET_ACCOUNT_QUERY
  });

  if (data && note?.id) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: getNoteDeleted(data?.account, note.id)
    });
  }
};

/* TAKES IN UPDATED ACCOUNT FIELDS AND REFORMATS ALL ACCOUNT DATA */
export const editAccountCache = (cache: ApolloCache<any>, account: Account) => {
  const data: AccountData | null = cache.readQuery({
    query: GET_ACCOUNT_QUERY
  });

  if (data?.account && account) {
    cache.writeQuery({
      query: GET_ACCOUNT_QUERY,
      data: { account: { ...data?.account, ...account } }
    });
  }
};
