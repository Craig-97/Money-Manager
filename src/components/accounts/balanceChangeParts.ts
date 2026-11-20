import { BalanceChange } from '~/lib/accounts';
import { formatBalance, formatPayment } from '~/lib/format';
import { accentTagClasses, greenTagClasses, tagClasses } from '../payments';

export const CHANGE_TAGS: Record<BalanceChange['tone'], string> = {
  accent: accentTagClasses,
  green: greenTagClasses,
  plain: tagClasses
};

/*
 * "+£14.12" in, "£250.00" out, as payments show; a balance typed in is how far it moved, either
 * way, so it says which. The next interest is an estimate.
 */
export const changeText = (change: BalanceChange) => {
  if (change.change === null) return '—';
  const text =
    change.kind === 'BALANCE_SET' && change.change < 0
      ? formatBalance(change.change)
      : formatPayment(change.change);
  return `${change.estimate ? '≈ ' : ''}${text}`;
};

// Money in green and out as an expense; a balance typed in is a correction, so it stays quiet
export const changeColour = (change: BalanceChange) => {
  if (change.change === null || change.kind === 'BALANCE_SET') return 'text-muted';
  return change.change > 0 ? 'text-income' : 'text-expense';
};

export const balanceAfterText = (change: BalanceChange) =>
  `${change.estimate ? '≈ ' : ''}${formatBalance(change.balanceAfter)}`;
