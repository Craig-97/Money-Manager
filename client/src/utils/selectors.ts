import { Account, Bill, OneOffPayment } from '../interfaces';

/* --------- DATA SELECTORS ---------*/

export const getAmountTotal = (amounts: Array<any>) =>
  amounts?.reduce((n, { amount }) => n + amount, 0);

export const getPaymentsDue = (
  oneOffPayments: Array<any>,
  bills: Array<Bill>
) =>
  oneOffPayments
    ?.concat(bills?.filter((bill: Bill) => bill.paid === false))
    .sort((a, b) => ((a?.amount || 0) > (b?.amount || 0) ? 1 : -1));

export const getDiscIncome = (monthlyIncome: number, billsTotal: number) =>
  monthlyIncome - billsTotal;

export const getBankFreeToSpend = (
  bankBalance: number,
  paymentsDueTotal: number
) => bankBalance - paymentsDueTotal;

export const getPayDayDiscIncome = (
  bankFreeToSpend: number,
  discIncome: number
) => bankFreeToSpend + discIncome;

/* --------- REDUCER SELECTORS --------- */

export const getNewBillAdded = (account: Account, bill: Bill) => {
  /* Adds new bill to current bill array and sorts based on amount field */
  const bills = [...account.bills, bill].sort((a, b) =>
    (a?.amount || 0) > (b?.amount || 0) ? 1 : -1
  );

  let newAccount = { ...account, ...{ bills } };

  /* Checks if new bill created has been paid this month, 
  if not then it  has to be added to the payments due array */
  if (bill?.amount && !bill?.paid) {
    newAccount = getNewOneOffPaymentAdded(newAccount, bill);
  }

  return newAccount;
};

/* Returns a paymentsDue array with the passed bill or one off payment id being removed */
const getFilteredPaymentsDue = (account: Account, id: string) =>
  account?.paymentsDue?.filter(
    (payment: Bill | OneOffPayment) => payment.id !== id
  );

/* Returns a new bills and paymentsDue array with the passed bill being removed */
export const getBillDeleted = (account: Account, billId: string) => {
  const bills = account?.bills?.filter((bill: Bill) => bill.id !== billId);

  const paymentsDue = getFilteredPaymentsDue(account, billId);

  return { ...account, ...{ bills, paymentsDue } };
};

/* Adds new one off payment to current payments due array and sorts based on amount field */
export const getNewOneOffPaymentAdded = (
  account: any,
  oneOffPayment: OneOffPayment
) => {
  const paymentsDue = [...(account.paymentsDue || []), oneOffPayment].sort(
    (a, b) => ((a?.amount || 0) > (b?.amount || 0) ? 1 : -1)
  );

  return { ...account, ...{ paymentsDue } };
};

export const getOneOffPaymentDeleted = (
  account: Account,
  paymentId: string
) => {
  return {
    ...account,
    ...{ paymentsDue: getFilteredPaymentsDue(account, paymentId) }
  };
};
