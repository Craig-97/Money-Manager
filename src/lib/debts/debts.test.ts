import { describe, expect, it } from 'vitest';
import {
  DebtPayment,
  debtTotals,
  isDebt,
  monthFromNow,
  monthlyPayment,
  payoffOrder,
  simulatePayoff
} from './debts';

const debt = (
  id: string,
  {
    balance,
    apr,
    amount,
    startingBalance = null,
    frequency = 'MONTHLY' as DebtPayment['frequency']
  }: {
    balance: number;
    apr: number;
    amount: number;
    startingBalance?: number | null;
    frequency?: DebtPayment['frequency'];
  }
): DebtPayment => ({
  kind: 'recurring',
  id,
  name: id,
  amount,
  signedAmount: -amount,
  type: 'EXPENSE',
  category: 'LOAN',
  frequency,
  firstPaymentDate: new Date(2026, 0, 15),
  lastPaymentDate: null,
  dueDate: new Date(2026, 9, 15),
  thisCycle: [],
  renewalDate: null,
  renewalReminderDays: 0,
  debt: { balance, startingBalance, apr, balanceUpdatedAt: null }
});

// The Debts design's three: a card, car finance and a loan from family
const card = debt('card', { balance: 2340, apr: 24.9, amount: 150, startingBalance: 3500 });
const car = debt('car', { balance: 6860, apr: 6.9, amount: 245, startingBalance: 12000 });
const family = debt('family', { balance: 800, apr: 0, amount: 100, startingBalance: 1500 });
const all = [card, car, family];

describe('isDebt', () => {
  it('picks out payments with a debt', () => {
    expect(isDebt(card)).toBe(true);
    expect(isDebt({ ...card, debt: null })).toBe(false);
  });
});

describe('monthlyPayment', () => {
  it('counts a weekly payment at its monthly average', () => {
    expect(
      monthlyPayment(debt('gym', { balance: 100, apr: 0, amount: 12, frequency: 'WEEKLY' }))
    ).toBeCloseTo(52);
  });
});

describe('payoffOrder', () => {
  it('pays the highest rate first for avalanche', () => {
    expect(payoffOrder(all, 'avalanche')).toEqual(['card', 'car', 'family']);
  });

  it('pays the smallest balance first for snowball', () => {
    expect(payoffOrder(all, 'snowball')).toEqual(['family', 'card', 'car']);
  });

  it('keeps the list order when nothing moves', () => {
    expect(payoffOrder(all, 'keep')).toEqual(['card', 'car', 'family']);
  });
});

describe('simulatePayoff', () => {
  it('adds a month of interest, then takes the payment off, as the API does', () => {
    const payoff = simulatePayoff([debt('loan', { balance: 1200, apr: 12, amount: 100 })]);
    // £1,200 + £12 − £100
    expect(payoff.series[1]).toBe(1112);
  });

  it('clears an interest-free debt in balance ÷ payment months', () => {
    const payoff = simulatePayoff([family]);
    expect(payoff).toMatchObject({ months: 8, interest: 0, clearedIn: { family: 8 } });
    expect(payoff.series.at(0)).toBe(800);
    expect(payoff.series.at(-1)).toBe(0);
  });

  it("never clears a debt whose payment doesn't cover its interest", () => {
    const payoff = simulatePayoff([debt('stuck', { balance: 1200, apr: 12, amount: 5 })]);
    expect(payoff.months).toBeNull();
    expect(payoff.clearedIn.stuck).toBeNull();
  });

  it('clears sooner and costs less with something extra each month', () => {
    const now = simulatePayoff(all);
    const extra = simulatePayoff(all, { extra: 50 });
    expect(extra.months!).toBeLessThan(now.months!);
    expect(extra.interest).toBeLessThan(now.interest);
  });

  it("moves a cleared debt's payment on to the next one, unless it's kept", () => {
    const keep = simulatePayoff(all, { strategy: 'keep' });
    const avalanche = simulatePayoff(all, { strategy: 'avalanche' });
    expect(avalanche.months!).toBeLessThan(keep.months!);
    expect(avalanche.interest).toBeLessThan(keep.interest);
  });

  it('pays the least interest with avalanche, and clears the smallest first with snowball', () => {
    const avalanche = simulatePayoff(all, { strategy: 'avalanche', extra: 100 });
    const snowball = simulatePayoff(all, { strategy: 'snowball', extra: 100 });
    expect(avalanche.interest).toBeLessThanOrEqual(snowball.interest);
    expect(snowball.clearedIn.family!).toBeLessThanOrEqual(avalanche.clearedIn.family!);
  });

  it('counts a debt already at nothing as cleared from the start', () => {
    expect(simulatePayoff([debt('done', { balance: 0, apr: 10, amount: 50 })])).toMatchObject({
      months: 0,
      clearedIn: { done: 0 }
    });
  });
});

describe('monthFromNow', () => {
  it('gives the first of the month that many months on', () => {
    expect(monthFromNow(new Date(2026, 9, 13), 19)).toEqual(new Date(2028, 4, 1));
  });
});

describe('debtTotals', () => {
  it('adds up what is left, what was borrowed and how much is paid off', () => {
    expect(debtTotals(all)).toMatchObject({
      left: 10000,
      started: 17000,
      paidOff: 7000,
      monthly: 495
    });
    expect(debtTotals(all).paidOffShare).toBeCloseTo(7000 / 17000);
  });

  it("counts a debt's balance as what was borrowed when that isn't known", () => {
    expect(debtTotals([debt('x', { balance: 500, apr: 0, amount: 50 })])).toMatchObject({
      started: 500,
      paidOff: 0,
      paidOffShare: 0
    });
  });

  it('is all zeros with no debts', () => {
    expect(debtTotals([])).toEqual({
      left: 0,
      started: 0,
      paidOff: 0,
      paidOffShare: 0,
      monthly: 0
    });
  });
});
