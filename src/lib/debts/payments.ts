import { PaymentFrequency } from '~/graphql/generated';

const PAYMENTS_PER_YEAR: Record<PaymentFrequency, number> = {
  WEEKLY: 52,
  BIWEEKLY: 26,
  MONTHLY: 12,
  QUARTERLY: 4,
  BIANNUALLY: 2,
  ANNUALLY: 1
};

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

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
    const periodInterest = roundPence((balance * debt.apr) / 100 / PAYMENTS_PER_YEAR[frequency]);
    interest += periodInterest;
    balance = Math.max(0, roundPence(balance + periodInterest - amount));
  }
  return {
    interest: roundPence(interest),
    reduction: roundPence(debt.balance - balance),
    balanceAfter: balance
  };
};
