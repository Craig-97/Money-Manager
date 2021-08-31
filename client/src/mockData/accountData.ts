import {
  getAmountTotal,
  getDiscIncome,
  getBankFreeToSpend,
  getPayDayDiscIncome
} from '../utils';
import { transactions } from '.';
import { Account } from '../interfaces';

export const getAccountData = (account: Account) => {
  if (!account) return {};

  const { bankBalance, monthlyIncome, bankPaydayTotal, bills, id } = account;
  const billsTotal = getAmountTotal(bills);
  const paymentsDue = bills?.filter((bill: any) => bill.paid === false);
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
