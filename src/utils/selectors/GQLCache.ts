import { Account, Bill, Note, OneOffPayment } from '../../types';
import { cheapestAscendingSort } from './account';

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
