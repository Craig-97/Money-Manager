import { Account, Bill, Note, OneOffPayment } from '../interfaces';

/* --------- DATA SELECTORS ---------*/

const cheapestAscendingSort = (a: Bill | OneOffPayment, b: Bill | OneOffPayment) => {
  const amount1 = a?.amount || 0;
  const amount2 = b?.amount || 0;

  return amount1 > amount2 ? 1 : -1;
};

export const getAmountTotal = (amounts: Array<any>) =>
  amounts?.reduce((n, { amount }) => n + amount, 0);

export const getPaymentsDue = (oneOffPayments: Array<Bill | OneOffPayment>, bills: Array<Bill>) =>
  oneOffPayments
    ?.concat(bills?.filter((bill: Bill) => bill.paid === false))
    .sort(cheapestAscendingSort);

export const getBills = (bills: Array<Bill>) => [...bills]?.sort(cheapestAscendingSort);

/* --------- UPDATE CACHE SELECTORS --------- */

/* Adds new one off payment to current payments due array and sorts based on amount field */
export const getNewOneOffPaymentAdded = (account: Account, oneOffPayment: OneOffPayment) => {
  const oneOffPayments = [...(account.oneOffPayments || []), oneOffPayment].sort(
    cheapestAscendingSort
  );

  return { account: { ...account, ...{ oneOffPayments } } };
};

/* Returns a oneOffPayments array with the passed payment id being removed */
export const getOneOffPaymentDeleted = (account: Account, id: string) => {
  const oneOffPayments = account?.oneOffPayments?.filter(
    (payment: OneOffPayment) => payment.id !== id
  );

  return {
    account: {
      ...account,
      ...{ oneOffPayments }
    }
  };
};

/* Adds new bill to current bill array and sorts based on amount field */
export const getNewBillAdded = (account: Account, bill: Bill) => {
  const bills = [...(account.bills || []), bill].sort(cheapestAscendingSort);

  return { account: { ...account, ...{ bills } } };
};

/* Returns a new bills array with the passed bill being removed */
export const getBillDeleted = (account: Account, billId: string) => {
  const bills = account?.bills?.filter((bill: Bill) => bill.id !== billId);

  return { account: { ...account, ...{ bills } } };
};

/* Adds new note to current note array */
export const getNewNoteAdded = (account: Account, note: Note) => {
  const notes = [...(account.notes || []), note];

  return { account: { ...account, ...{ notes } } };
};

/* Returns a new notes array with the passed note being removed */
export const getNoteDeleted = (account: Account, noteId: string) => {
  const notes = account?.notes?.filter((note: Note) => note.id !== noteId);

  return { account: { ...account, ...{ notes } } };
};
