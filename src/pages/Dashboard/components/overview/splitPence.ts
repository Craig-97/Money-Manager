import { formatBalance } from '~/lib/format';

export const splitPence = (amount: number) => {
  const text = formatBalance(amount);
  const dot = text.lastIndexOf('.');
  return [text.slice(0, dot), text.slice(dot)] as const;
};
