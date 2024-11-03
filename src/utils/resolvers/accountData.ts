import { Account } from '~/types';
import { getAmountTotal, getBills, getPaymentsDue } from '../selectors';
import { AccountState } from '~/types';
import { initialState } from '~/state/account-context';

export const getAccountData = (account?: Account): AccountState => {
  if (!account) return initialState.account;

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
    payDayDiscIncome,
    paydayConfig: payday
  };
};
