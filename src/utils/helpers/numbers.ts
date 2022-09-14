/* Returns fixed number or 0 if number is undefined */
export const getNumberAmount = (number: string | undefined) =>
  number ? Number(parseFloat(number).toFixed(2)) : 0;

/* Returns true is number passed is defined and negative */
export const isNegative = (number: number | undefined) => number && number < 0;

/* Formats number to remove negative sign or return 0 if undefined*/
export const positiveNumber = (number: number | undefined) => (number ? Math.abs(number) : 0);

/* Takes positive number and returns it to 2 decimal places */
export const formatAmount = (number: number | undefined) => positiveNumber(number).toFixed(2);
