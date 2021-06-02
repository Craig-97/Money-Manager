import { getAmountTotal, getDiscIncome, getBankFreeToSpend, getPayDayDiscIncome } from '../utils';
import { paymentsDue, bills, transactions } from './';

export const getAccountData = account => {
  if (!account) return {};

  const { bankBalance, monthlyIncome, bankPaydayTotal, id } = account;
  const billsTotal = getAmountTotal(bills);
  const paymentsDueTotal = getAmountTotal(paymentsDue);
  const discIncome = getDiscIncome(monthlyIncome, billsTotal);
  const bankFreeToSpend = getBankFreeToSpend(bankBalance, paymentsDueTotal);
  const payDayDiscIncome = getPayDayDiscIncome(bankFreeToSpend, discIncome);

  return {
    id,
    bills,
    paymentsDue,
    bankBalance,
    monthlyIncome,
    billsTotal,
    paymentsDueTotal,
    bankPaydayTotal,
    discIncome,
    bankFreeToSpend,
    payDayDiscIncome,
    transactions
  };
};
