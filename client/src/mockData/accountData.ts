import {
  getAmountTotal,
  getDiscIncome,
  getBankFreeToSpend,
  getPayDayDiscIncome,
  getPaymentsDue
} from '../utils';
import { transactions } from '.';
import { Account } from '../interfaces';

export const getAccountData = (account: Account) => {
  if (!account) return {};

  const {
    bankBalance,
    monthlyIncome,
    bankPaydayTotal,
    bills,
    oneOffPayments,
    paymentsDue: oldPaymentsDue,
    id
  } = account;
  const billsTotal = getAmountTotal(bills);
  const paymentsDue = oldPaymentsDue ? oldPaymentsDue : getPaymentsDue(oneOffPayments || [], bills);
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
