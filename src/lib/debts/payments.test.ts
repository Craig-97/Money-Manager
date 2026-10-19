import { describe, expect, it } from 'vitest';
import { payTowardsDebt } from './payments';

describe('payTowardsDebt', () => {
  it('adds the interest first, so only the rest comes off', () => {
    // £2,340 at 24.9%: £48.56 of the £150 is the month's interest
    expect(
      payTowardsDebt({ balance: 2340, apr: 24.9 }, { amount: 150, frequency: 'MONTHLY' })
    ).toEqual({ interest: 48.56, reduction: 101.44, balanceAfter: 2238.56 });
  });

  it('pays several dates in turn, each on the smaller balance', () => {
    expect(
      payTowardsDebt({ balance: 1000, apr: 12 }, { amount: 20, frequency: 'MONTHLY', times: 2 })
    ).toEqual({ interest: 19.9, reduction: 20.1, balanceAfter: 979.9 });
  });

  it('never goes below nothing owed', () => {
    expect(
      payTowardsDebt({ balance: 50, apr: 0 }, { amount: 80, frequency: 'MONTHLY' })
    ).toMatchObject({ reduction: 50, balanceAfter: 0 });
  });
});
