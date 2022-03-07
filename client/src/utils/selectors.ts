import { Account, Bill, OneOffPayment } from '../interfaces';

/* Data selectors */
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

export const getNewBillAdded = (account: Account, bill: Bill) => {
  let newAccount = { ...account, ...{ bills: [...account.bills, bill] } };

  /* Checks if new bill created has been paid this month, 
  if not then it  has to be added to the payments due array */
  if (bill?.amount && !bill?.paid) {
    newAccount = getNewOneOffPaymentAdded(newAccount, bill);
  }

  return newAccount;
};

export const getNewOneOffPaymentAdded = (
  account: any,
  oneOffPayment: OneOffPayment
) => {
  const paymentsDue = [...(account.paymentsDue || []), oneOffPayment].sort(
    (a, b) => ((a?.amount || 0) > (b?.amount || 0) ? 1 : -1)
  );

  return { ...account, ...{ paymentsDue } };
};
