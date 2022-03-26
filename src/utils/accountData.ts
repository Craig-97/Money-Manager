import {
  getAmountTotal,
  getDiscIncome,
  getBankFreeToSpend,
  getPayDayDiscIncome,
  getPaymentsDue,
  getBills,
  getPaydayTotal
} from '.';
import { Account } from '../interfaces';

export const getAccountData = (account: Account) => {
  if (!account) return {};

  const {
    bankBalance,
    monthlyIncome,
    bills: unsortedBills,
    oneOffPayments,
    paymentsDue: oldPaymentsDue,
    notes,
    id
  } = account;

  const bills = getBills(unsortedBills);
  const billsTotal = getAmountTotal(bills);
  const paymentsDue = oldPaymentsDue ? oldPaymentsDue : getPaymentsDue(oneOffPayments || [], bills);
  const paymentsDueTotal = getAmountTotal(paymentsDue);
  const discIncome = getDiscIncome(monthlyIncome, billsTotal);
  const bankFreeToSpend = getBankFreeToSpend(bankBalance, paymentsDueTotal);
  const payDayDiscIncome = getPayDayDiscIncome(bankFreeToSpend, discIncome);
  const bankPaydayTotal = getPaydayTotal(bankFreeToSpend, monthlyIncome);

  return {
    id,
    bills,
    notes,
    paymentsDue,
    bankBalance,
    monthlyIncome,
    billsTotal,
    paymentsDueTotal,
    bankPaydayTotal,
    discIncome,
    bankFreeToSpend,
    payDayDiscIncome
  };
};
