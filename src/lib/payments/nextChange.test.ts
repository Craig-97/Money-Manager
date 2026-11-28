import { describe, expect, it } from 'vitest';
import {
  NextChange,
  nextChangeLine,
  nextChangeOf,
  nextChangeText,
  renewalChangeOf
} from './nextChange';
import { RecurringPayment } from './payments';
import { recurringPayment } from '~/test/builders';
import { day, TODAY } from '~/test/dates';

const payment = (overrides: Partial<RecurringPayment> = {}) =>
  recurringPayment({ id: 'gym', name: 'Gym', ...overrides });

const mortgage = (rateEndsOn: Date, overrides: Partial<RecurringPayment> = {}) =>
  payment({
    id: 'mortgage',
    debt: {
      balance: 148200,
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

const text = (item: RecurringPayment, form: 'long' | 'short' | 'when' = 'long') =>
  nextChangeText(nextChangeOf(item, TODAY)!, { today: TODAY, form });

describe('nextChangeOf', () => {
  it('has nothing for a payment that keeps going', () => {
    expect(nextChangeOf(payment(), TODAY)).toBeNull();
  });

  it('reads a renewal', () => {
    expect(nextChangeOf(payment({ renewalDate: day('2027-02-02') }), TODAY)).toMatchObject({
      kind: 'renews',
      days: 123,
      soon: false,
      passed: false
    });
  });

  it('reads a stop, coming up inside the renewal reminder', () => {
    expect(nextChangeOf(payment({ lastPaymentDate: day('2027-03-01') }), TODAY)).toMatchObject({
      kind: 'stops',
      soon: false,
      passed: false
    });
    expect(nextChangeOf(payment({ lastPaymentDate: day('2026-10-07') }), TODAY)).toMatchObject({
      kind: 'stops',
      days: 5,
      soon: true
    });
    expect(nextChangeOf(payment({ lastPaymentDate: day('2026-11-01') }), TODAY)).toMatchObject({
      days: 30,
      soon: true
    });
    expect(nextChangeOf(payment({ lastPaymentDate: day('2026-11-02') }), TODAY)).toMatchObject({
      days: 31,
      soon: false
    });
  });

  it('uses the usual 30 days for a stop when the renewal reminder is off', () => {
    const off = { renewalReminderDays: 0 };
    expect(
      nextChangeOf(payment({ ...off, lastPaymentDate: day('2026-10-20') }), TODAY)
    ).toMatchObject({ soon: true });
    expect(
      nextChangeOf(payment({ ...off, lastPaymentDate: day('2026-12-20') }), TODAY)
    ).toMatchObject({ soon: false });
  });

  it('has nothing once the payment has ended', () => {
    expect(
      nextChangeOf(payment({ dueDate: null, lastPaymentDate: day('2026-09-20') }), TODAY)
    ).toBeNull();
  });

  it('reads a debt rate end, coming up inside its reminder and red once gone by', () => {
    expect(nextChangeOf(mortgage(day('2027-03-01')), TODAY)).toMatchObject({
      kind: 'rateEnds',
      soon: false
    });
    expect(nextChangeOf(mortgage(day('2026-11-20')), TODAY)).toMatchObject({
      kind: 'rateEnds',
      days: 49,
      soon: true
    });
    expect(nextChangeOf(mortgage(day('2026-09-20')), TODAY)).toMatchObject({
      kind: 'rateEnds',
      passed: true
    });
  });

  it('prefers whichever of a renewal and a stop comes first', () => {
    const stopsFirst = { renewalDate: day('2027-02-02'), lastPaymentDate: day('2026-12-01') };
    expect(nextChangeOf(payment(stopsFirst), TODAY)).toMatchObject({ kind: 'stops' });
    const renewsFirst = { renewalDate: day('2026-11-02'), lastPaymentDate: day('2027-03-01') };
    expect(nextChangeOf(payment(renewsFirst), TODAY)).toMatchObject({ kind: 'renews' });
  });
});

describe('renewalChangeOf', () => {
  it('leaves out a stop, keeping a renewal or a rate end', () => {
    expect(renewalChangeOf(payment({ lastPaymentDate: day('2026-10-07') }), TODAY)).toBeNull();
    expect(
      renewalChangeOf(
        payment({ lastPaymentDate: day('2026-10-07'), renewalDate: day('2027-02-02') }),
        TODAY
      )
    ).toMatchObject({ kind: 'renews' });
    expect(renewalChangeOf(mortgage(day('2027-03-01')), TODAY)).toMatchObject({
      kind: 'rateEnds'
    });
  });
});

describe('nextChangeText', () => {
  it('keeps the wording of a renewal', () => {
    const renews = payment({ renewalDate: day('2026-10-24') });
    expect(text(renews)).toBe('Renews in 22 days');
    expect(text(renews, 'short')).toBe('In 22 days');
    expect(text(renews, 'when')).toBe('22 days');
  });

  it('says when it stops, or that the last one is close', () => {
    expect(text(payment({ lastPaymentDate: day('2027-03-01') }))).toBe('Ends 1 Mar 2027');
    expect(text(payment({ lastPaymentDate: day('2026-12-24') }), 'short')).toBe('Ends 24 Dec');
    expect(text(payment({ lastPaymentDate: day('2026-10-07') }))).toBe('Last one in 5 days');
    expect(text(payment({ lastPaymentDate: day('2026-10-03') }))).toBe('Last one tomorrow');
    expect(text(payment({ lastPaymentDate: day('2026-10-02') }))).toBe('Last one today');
    expect(text(payment({ lastPaymentDate: day('2027-03-01') }), 'when')).toBe('Ends in 21 weeks');
  });

  it('says when a rate ends, with the year unless the column is for this year', () => {
    expect(text(mortgage(day('2027-03-01')))).toBe('Rate ends 1 Mar 2027');
    expect(text(mortgage(day('2027-03-01')), 'short')).toBe('Rate ends 1 Mar 2027');
    const thisYear = mortgage(day('2026-12-31'), { renewalReminder: { off: true, days: null } });
    expect(text(thisYear)).toBe('Rate ends 31 Dec 2026');
    expect(text(thisYear, 'short')).toBe('Rate ends 31 Dec');
  });

  it('says a rate end is coming up, or has gone by', () => {
    expect(text(mortgage(day('2026-11-20')), 'short')).toBe('Rate ends in 49 days');
    expect(text(mortgage(day('2026-11-20')))).toBe('Rate ends in 49 days');
    expect(text(mortgage(day('2026-09-20')))).toBe('Rate ended');
    expect(text(mortgage(day('2027-03-01')), 'when')).toBe('Rate ends in 21 weeks');
  });
});

describe('nextChangeLine', () => {
  const line = (item: RecurringPayment) =>
    nextChangeLine(item, {
      next: nextChangeOf(item, TODAY) as NextChange,
      today: TODAY,
      money: '£750.00'
    });

  it('gives the date and what it costs, saying so once a renewal or rate end has gone by', () => {
    expect(line(payment({ renewalDate: day('2026-09-28') }))).toBe(
      'Renewed Mon 28 Sep · £750.00 a month'
    );
    expect(line(mortgage(day('2026-09-20')))).toBe('Rate ended Sun 20 Sep · £750.00 a month');
    expect(line(mortgage(day('2027-03-01')))).toBe('Mon 1 Mar 2027 · £750.00 a month');
  });
});
