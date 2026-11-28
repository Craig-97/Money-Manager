import { PaymentFrequency } from '~/graphql/generated';
import { formatMonthYear } from '~/lib/dates';
import { monthFromNow, simulatePayoff } from '~/lib/debts';
import { formatMoney, roundPence } from '~/lib/format';
import { PER_MONTH, PER_PERIOD } from '~/lib/payments';

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

// "£35", or "£35.50" when there are pence
const money = (amount: number) => formatMoney(amount, { whole: Number.isInteger(amount) });

/*
 * When the debt would be paid off at this payment, for the form's summary, or that the payment
 * doesn't cover the interest, so what's owed grows. That says it all, so it has no label.
 */
export const paidOffRow = (
  { balance, apr, amount, frequency }: PayoffFigures,
  today: Date
): { label: string; value: string } => {
  const row = (value: string) => ({ label: 'Paid off', value });
  if (balance === null) return row('Shown once you add the balance');
  if (balance === 0) return row('Already paid off');
  if (apr === null) return row('Shown once you add the APR');
  if (amount === null || amount <= 0) return row('Shown once you add the amount');

  const { months } = simulatePayoff([{ id: 'debt', amount, frequency, debt: { balance, apr } }]);
  if (months === null) {
    // A payment's share of a year's interest
    const interest = roundPence((balance * apr) / 100 / 12 / PER_MONTH[frequency]);
    return {
      label: '',
      value: `${money(amount)} doesn’t cover the ${money(interest)} interest, so it will grow`
    };
  }
  return row(
    `About ${formatMonthYear(monthFromNow(today, months))} at ${money(amount)} ${PER_PERIOD[frequency]}`
  );
};
