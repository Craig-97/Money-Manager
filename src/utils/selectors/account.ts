import { Bill, OneOffPayment } from '~/types';

export const cheapestAscendingSort = (a: Bill | OneOffPayment, b: Bill | OneOffPayment) => {
  const amount1 = a?.amount || 0;
  const amount2 = b?.amount || 0;
  const name1 = a?.name || '';
  const name2 = b?.name || '';

  return amount1 - amount2 || name1?.localeCompare(name2);
};

export const getAmountTotal = (amounts: Array<Bill | OneOffPayment>) =>
  amounts?.reduce((n, { amount }) => (amount ? n + amount : n), 0);

export const getPaymentsDue = (oneOffPayments: Array<Bill | OneOffPayment>, bills: Array<Bill>) =>
  oneOffPayments
    ?.concat(bills?.filter((bill: Bill) => bill.paid === false))
    .sort(cheapestAscendingSort);

export const getBills = (bills: Array<Bill>) => [...bills]?.sort(cheapestAscendingSort);
