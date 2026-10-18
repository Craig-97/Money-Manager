import { PaymentFrequency } from '~/graphql/generated';
import { formatMonthYear } from '~/lib/dates';
import { monthFromNow, simulatePayoff } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { PER_PERIOD } from '~/lib/payments';

// A rate with up to two decimal places, e.g. 24.9 or 6.95
const APR_INPUT = /^\d+(\.\d{0,2})?$|^\.\d{1,2}$/;

/* An APR typed into the form: a number from 0 to 100, or null if it isn't one */
export const parseApr = (value: string) => {
  const cleaned = value.replace(/[%\s]/g, '');
  if (!APR_INPUT.test(cleaned)) return null;
  const apr = Number(cleaned);
  return apr <= 100 ? apr : null;
};

interface PayoffFigures {
  balance: number | null;
  apr: number | null;
  amount: number | null;
  frequency: PaymentFrequency;
}

/* When the debt would be paid off at this payment, for the form's summary */
export const paidOffText = ({ balance, apr, amount, frequency }: PayoffFigures, today: Date) => {
  if (balance === null) return 'Shown once you add the balance';
  if (balance === 0) return 'Already paid off';
  if (apr === null) return 'Shown once you add the APR';
  if (amount === null || amount <= 0) return 'Shown once you add the amount';

  const pace = `${formatMoney(amount, { whole: Number.isInteger(amount) })} ${PER_PERIOD[frequency]}`;
  const { months } = simulatePayoff([{ id: 'debt', amount, frequency, debt: { balance, apr } }]);
  return months === null
    ? `Not at ${pace}: it doesn't cover the interest`
    : `About ${formatMonthYear(monthFromNow(today, months))} at ${pace}`;
};
