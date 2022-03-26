import { getAmountTotal, getPaymentsDue, getBills } from '.';
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
