export const getNumberAmount = (number: string | undefined) =>
  number ? Number(parseFloat(number).toFixed(2)) : 0;

export const stringToFixedNumber = (number: string) =>
  Number(parseFloat(number).toFixed(2));
