/** Returns true if number passed is defined and negative */
export const isNegative = (number: number | undefined) => typeof number === 'number' && number < 0;

/** Formats number to remove negative sign or return 0 if undefined */
export const positiveNumber = (number: number | undefined) =>
  typeof number === 'number' ? Math.abs(number) : 0;

/** Takes positive number and returns it to 2 decimal places */
export const formatAmount = (number: number | undefined) => positiveNumber(number).toFixed(2);
