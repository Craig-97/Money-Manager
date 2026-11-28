import { describe, expect, it } from 'vitest';
import { Debt, RecurringPayment } from './payments';
import {
  isRateEndDue,
  rateEndHeading,
  rateEndOf,
  rateEndsLine,
  rateEndsTimingOptions,
  rateUntilText,
  toRateEndsChoice
} from './rateEnds';
import { recurringPayment } from '~/test/builders';
import { day, TODAY } from '~/test/dates';

// A mortgage whose fixed rate ends on the 31st of December, 90 days from today
const mortgage = (
  { rateEndsOn = day('2026-12-31'), balance = 148200 }: Partial<Debt> = {},
  overrides: Partial<RecurringPayment> = {}
) =>
  recurringPayment({
    id: 'Mortgage',
    amount: 750,
    category: 'FINANCES',
    debt: {
      balance,
      startingBalance: 165000,
      apr: 4.29,
      balanceUpdatedAt: null,
      paidOffThisCycle: 0,
      accrued: 0,
      accruedTo: null,
      rateEndsOn
    },
    ...overrides
  });

describe('rateEndOf', () => {
  it('has none for a payment that is not a debt, or a debt without a rate end', () => {
    expect(rateEndOf(recurringPayment({ id: 'Gym' }), TODAY)).toBeNull();
    expect(rateEndOf(mortgage({ rateEndsOn: null }), TODAY)).toBeNull();
  });

  it('has none once the debt is paid off', () => {
    expect(rateEndOf(mortgage({ balance: 0 }), TODAY)).toBeNull();
  });

  it('comes up 3 months before, unless its reminder says otherwise', () => {
    expect(rateEndOf(mortgage(), TODAY)).toMatchObject({ days: 90, soon: true, passed: false });
    expect(rateEndOf(mortgage({ rateEndsOn: day('2027-01-01') }), TODAY)).toMatchObject({
      days: 91,
      soon: false
    });
    // A week before, from its own reminder
    const week = mortgage({}, { renewalReminder: { off: false, days: 7 } });
    expect(rateEndOf(week, TODAY)).toMatchObject({ soon: false });
    expect(rateEndOf(week, day('2026-12-24'))).toMatchObject({ days: 7, soon: true });
  });

  it('never comes up with its reminder off, until it has gone by', () => {
    const off = mortgage({}, { renewalReminder: { off: true, days: null } });
    expect(rateEndOf(off, day('2026-12-30'))).toMatchObject({ soon: false, passed: false });
    expect(rateEndOf(off, day('2027-01-04'))).toMatchObject({ passed: true });
  });

  it('has gone by the day after, without a new one being set', () => {
    expect(rateEndOf(mortgage(), day('2026-12-31'))).toMatchObject({ days: 0, passed: false });
    const passed = rateEndOf(mortgage(), day('2027-01-04'))!;
    expect(passed).toMatchObject({ days: -4, passed: true, soon: false });
    expect(isRateEndDue(passed)).toBe(true);
  });
});

describe('how a rate end reads', () => {
  it('words the alert, and the line under a debt’s rate', () => {
    const payment = mortgage();
    const rateEnd = rateEndOf(payment, TODAY)!;

    expect(rateEndHeading(payment, rateEnd)).toBe('Mortgage rate ends on Thu 31 Dec');
    expect(rateEndHeading(payment, { ...rateEnd, passed: true })).toBe('Mortgage rate has ended');
    expect(rateUntilText(day('2027-03-01'))).toBe('until 1 Mar 2027');
  });

  it('says in the debt’s view when the fixed rate ends, or ended', () => {
    expect(rateEndsLine(day('2027-03-01'), TODAY)).toBe('Fixed rate ends Mon 1 Mar 2027');
    expect(rateEndsLine(day('2026-09-28'), TODAY)).toBe('Fixed rate ended Mon 28 Sep 2026');
  });

  it('offers 3 months before as well as the renewals’ choices, and no usual timing', () => {
    expect(rateEndsTimingOptions.map(option => option.label)).toEqual([
      '1 week before',
      '2 weeks before',
      '1 month before',
      '3 months before',
      'Off'
    ]);
    expect(toRateEndsChoice('usual')).toBe('90');
    expect(toRateEndsChoice('14')).toBe('14');
    expect(toRateEndsChoice('off')).toBe('off');
  });
});
