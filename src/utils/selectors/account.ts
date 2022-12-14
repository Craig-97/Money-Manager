import { Bill, OneOffPayment } from '~/types';

export const cheapestAscendingSort = (a: Bill | OneOffPayment, b: Bill | OneOffPayment) => {
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
