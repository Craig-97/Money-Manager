import { initialAccountState } from '~/state';
import { Account } from '~/types';
import { AccountState } from '~/types';
import { getAmountTotal, getPaymentTypeTotal, getBills, getPaymentsDue } from '~/utils';

export const getAccountData = (account?: Account): AccountState => {
  if (!account) return initialAccountState;

  const {
    bankBalance,
    monthlyIncome,
    bills: unsortedBills,
    oneOffPayments,
    notes,
    id,
    payday
  } = account;

  const bills = getBills(unsortedBills);
  const billsTotal = getAmountTotal(bills);
  const paymentsDue = getPaymentsDue(oneOffPayments || [], bills);
  const paymentsDueTotal = getPaymentTypeTotal(paymentsDue);
  const discIncome = monthlyIncome - billsTotal;
  const bankFreeToSpend = bankBalance - paymentsDueTotal;
  const payDayDiscIncome = bankFreeToSpend + discIncome;
  const bankPaydayBalance = bankFreeToSpend + monthlyIncome;

  return {
    id,
    bills,
    notes,
    paymentsDue,
    bankBalance,
    monthlyIncome,
    billsTotal,
    paymentsDueTotal,
    bankPaydayBalance,
    discIncome,
    bankFreeToSpend,
    payDayDiscIncome,
    paydayConfig: payday
  };
};
