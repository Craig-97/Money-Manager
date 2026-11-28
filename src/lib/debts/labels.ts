import { formatLongMonth, formatMonthYear } from '../dates';
import { formatMoney, ordinal, plural, roundPence } from '../format';
import { DebtPayment, extraPerPayment, monthFromNow, Payoff } from './debts';

// How debts read on the Debts pages

/* "on the 15th" for a monthly debt, otherwise how often: "weekly" */
export const whenPaid = (debt: DebtPayment) =>
  debt.frequency === 'MONTHLY'
    ? `on the ${ordinal(debt.firstPaymentDate.getDate())}`
    : {
        WEEKLY: 'weekly',
        BIWEEKLY: 'fortnightly',
        QUARTERLY: 'quarterly',
        BIANNUALLY: 'every 6 months',
        ANNUALLY: 'yearly'
      }[debt.frequency];

/* "24.9%", "0.0%", or with a second decimal when it has one: "4.29%" */
export const aprText = (apr: number) => `${apr.toFixed(Number.isInteger(apr * 10) ? 1 : 2)}%`;

/* The month a debt clears, or "Never" when its payment doesn't cover the interest */
export const clearedText = (months: number | null | undefined, today: Date) =>
  months === null || months === undefined ? 'Never' : formatMonthYear(monthFromNow(today, months));

/* "£150 on the 15th", "£30 weekly" */
export const paymentText = (debt: DebtPayment) =>
  `${formatMoney(debt.amount, { whole: Number.isInteger(debt.amount) })} ${whenPaid(debt)}`;

/*
 * Some extra a month against how things are now: "11 months sooner" (or "Cleared at last" when it
 * never cleared before) and "£308 less than now", each "Same as now" when nothing changes
 */
export const comparedToNow = (base: Payoff, plan: Payoff) => {
  const months = base.months !== null && plan.months !== null ? base.months - plan.months : 0;
  const saved = Math.round(base.interest - plan.interest);
  return {
    sooner:
      base.months === null && plan.months !== null
        ? 'Cleared at last'
        : months > 0
          ? `${plural(months, 'month')} sooner`
          : 'Same as now',
    saved: saved > 0 ? `${formatMoney(saved, { whole: true })} less than now` : 'Same as now'
  };
};

/* Applying some extra a month: the debt's new payment, from the month of its next one */
export const applyChange = (debt: DebtPayment, extra: number) => ({
  amount: roundPence(debt.amount + extraPerPayment(debt, extra)),
  from: debt.dueDate ? formatLongMonth(debt.dueDate) : 'now'
});
