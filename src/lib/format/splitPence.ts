import { formatBalance } from './money';

/* "£10,000" and ".00", for the big figures that show the pence smaller */
export const splitPence = (amount: number) => {
  const text = formatBalance(amount);
  const dot = text.lastIndexOf('.');
  return [text.slice(0, dot), text.slice(dot)] as const;
};
