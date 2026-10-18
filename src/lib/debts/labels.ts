import { formatMonthYear } from '~/lib/dates';
import { formatMoney } from '~/lib/format';
import { ordinal } from '~/lib/payments';
import { DebtPayment, monthFromNow } from './debts';

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

/* "24.9%", "0.0%" */
export const aprText = (apr: number) => `${apr.toFixed(1)}%`;

/* The month a debt clears, or "Never" when its payment doesn't cover the interest */
export const clearedText = (months: number | null | undefined, today: Date) =>
  months === null || months === undefined ? 'Never' : formatMonthYear(monthFromNow(today, months));

/* "£150 on the 15th", "£30 weekly" */
export const paymentText = (debt: DebtPayment) =>
  `${formatMoney(debt.amount, { whole: Number.isInteger(debt.amount) })} ${whenPaid(debt)}`;
