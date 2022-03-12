import { Account, Bill, OneOffPayment } from '../interfaces';

/* --------- DATA SELECTORS ---------*/

export const getAmountTotal = (amounts: Array<any>) =>
  amounts?.reduce((n, { amount }) => n + amount, 0);

export const getPaymentsDue = (oneOffPayments: Array<any>, bills: Array<Bill>) =>
  oneOffPayments
    ?.concat(bills?.filter((bill: Bill) => bill.paid === false))
    .sort((a, b) => ((a?.amount || 0) > (b?.amount || 0) ? 1 : -1));

export const getDiscIncome = (monthlyIncome: number, billsTotal: number) =>
  monthlyIncome - billsTotal;

export const getBankFreeToSpend = (bankBalance: number, paymentsDueTotal: number) =>
  bankBalance - paymentsDueTotal;

export const getPayDayDiscIncome = (bankFreeToSpend: number, discIncome: number) =>
  bankFreeToSpend + discIncome;

/* --------- UPDATE CACHE SELECTORS --------- */

/* Returns a oneOffPayments array with the passed payment id being removed */
const getFilteredOneOffPayments = (account: Account, id: string) =>
  account?.oneOffPayments?.filter((payment: OneOffPayment) => payment.id !== id);

/* Adds new one off payment to current payments due array and sorts based on amount field */
export const getNewOneOffPaymentAdded = (account: Account, oneOffPayment: OneOffPayment) => {
  const oneOffPayments = [...(account.oneOffPayments || []), oneOffPayment].sort((a, b) =>
    (a?.amount || 0) > (b?.amount || 0) ? 1 : -1
  );

  return { account: { ...account, ...{ oneOffPayments } } };
};

export const getOneOffPaymentDeleted = (account: Account, paymentId: string) => {
  return {
    account: {
      ...account,
      ...{ oneOffPayments: getFilteredOneOffPayments(account, paymentId) }
    }
  };
};

export const getNewBillAdded = (account: Account, bill: Bill) => {
  /* Adds new bill to current bill array and sorts based on amount field */
  const bills = [...(account.bills || []), bill].sort((a, b) =>
    (a?.amount || 0) > (b?.amount || 0) ? 1 : -1
  );

  return { account: { ...account, ...{ bills } } };
};

/* Returns a new bills and array with the passed bill being removed */
export const getBillDeleted = (account: Account, billId: string) => {
  const bills = account?.bills?.filter((bill: Bill) => bill.id !== billId);

  return { account: { ...account, ...{ bills } } };
};
