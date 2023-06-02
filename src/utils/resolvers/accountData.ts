import { Account } from '~/types';
import { getAmountTotal, getBills, getPaymentsDue } from '../selectors';

export const getAccountData = (account: Account) => {
  if (!account) return {};

  const { bankBalance, monthlyIncome, bills: unsortedBills, oneOffPayments, notes, id } = account;

  const bills = getBills(unsortedBills);
  const billsTotal = getAmountTotal(bills);
  const paymentsDue = getPaymentsDue(oneOffPayments || [], bills);
  const paymentsDueTotal = getAmountTotal(paymentsDue);
  const discIncome = monthlyIncome - billsTotal;
  const bankFreeToSpend = bankBalance - paymentsDueTotal;
  const payDayDiscIncome = bankFreeToSpend + discIncome;
  const bankPaydayTotal = bankFreeToSpend + monthlyIncome;

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
