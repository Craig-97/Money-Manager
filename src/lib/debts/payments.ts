import { PaymentFrequency } from '~/graphql/generated';
import { roundPence } from '~/lib/format';
import { PER_YEAR } from '~/lib/payments';

interface PaidOff {
  interest: number;
  // How much less is owed afterwards
  reduction: number;
  balanceAfter: number;
}

/*
 * What paying a debt does, as the API records it: each period's interest goes on first, then the
 * payment comes off, so only the rest reduces what's owed. Several dates are paid in turn.
 */
export const payTowardsDebt = (
  debt: { balance: number; apr: number },
  { amount, frequency, times = 1 }: { amount: number; frequency: PaymentFrequency; times?: number }
): PaidOff => {
  let balance = debt.balance;
  let interest = 0;
  for (let k = 0; k < times; k++) {
    const periodInterest = roundPence((balance * debt.apr) / 100 / PER_YEAR[frequency]);
    interest += periodInterest;
    balance = Math.max(0, roundPence(balance + periodInterest - amount));
  }
  return {
    interest: roundPence(interest),
    reduction: roundPence(debt.balance - balance),
    balanceAfter: balance
  };
};
