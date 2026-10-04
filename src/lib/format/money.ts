// Money as the design shows it: pounds with pence, a real minus sign for negative balances, and
// a plus on money coming in.

const pounds = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const wholePounds = new Intl.NumberFormat('en-GB', {
  style: 'currency',
  currency: 'GBP',
  maximumFractionDigits: 0
});

const plain = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export const MINUS = '−';

interface MoneyOptions {
  // Leave the pence off, e.g. "£328 a day"
  whole?: boolean;
}

/* "£1,234.56", ignoring the sign */
export const formatMoney = (amount: number, { whole = false }: MoneyOptions = {}) =>
  (whole ? wholePounds : pounds).format(Math.abs(amount));

/* "−£12.50" below zero, for balances that can go overdrawn */
export const formatBalance = (amount: number, options?: MoneyOptions) =>
  (amount < 0 ? MINUS : '') + formatMoney(amount, options);

/* "+£10.00" for money in; money out shows without a sign, coloured as an expense */
export const formatPayment = (signedAmount: number) =>
  (signedAmount < 0 ? '' : '+') + formatMoney(signedAmount);

/* "1,234.56", as an amount field's starting text */
export const formatMoneyInput = (amount: number) => plain.format(amount);

const MONEY_INPUT = /^\d+(\.\d{0,2})?$|^\.\d{1,2}$/;

/* What someone typed in an amount field -> pounds to the penny, or null if it isn't an amount */
export const parseMoney = (value: string) => {
  const cleaned = value.replace(/[£,\s]/g, '');
  if (!MONEY_INPUT.test(cleaned)) return null;
  return Math.round(Number(cleaned) * 100) / 100;
};
