export const getNumberAmount = (number: string | undefined) =>
  number ? Number(parseFloat(number).toFixed(2)) : 0;

export const stringToFixedNumber = (number: string) => Number(parseFloat(number).toFixed(2));

export const getDateFromTimestamp = (number: number) => new Date(number).toLocaleDateString();

export const isNegative = (number: number | undefined) => number && number < 0;

export const formatAmount = (number: number | undefined) => number && Math.abs(number).toFixed(2);
