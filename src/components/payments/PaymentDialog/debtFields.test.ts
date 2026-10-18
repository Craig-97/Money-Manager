import { describe, expect, it } from 'vitest';
import { paidOffText, parseApr } from './debtFields';

const today = new Date(2026, 9, 2);

describe('parseApr', () => {
  it('reads a rate from 0 to 100, with or without a % sign', () => {
    expect(parseApr('24.9')).toBe(24.9);
    expect(parseApr('0')).toBe(0);
    expect(parseApr('6.95%')).toBe(6.95);
    expect(parseApr('100')).toBe(100);
  });

  it("isn't a rate when it's empty, over 100 or not a number", () => {
    expect(parseApr('')).toBeNull();
    expect(parseApr('100.5')).toBeNull();
    expect(parseApr('-3')).toBeNull();
    expect(parseApr('abc')).toBeNull();
  });
});

describe('paidOffText', () => {
  const figures = { balance: 800, apr: 0, amount: 100, frequency: 'MONTHLY' as const };

  it('gives the month it would be paid off, and at what', () => {
    expect(paidOffText(figures, today)).toBe('About Jun 2027 at £100 a month');
  });

  it('says how often for other schedules', () => {
    expect(paidOffText({ ...figures, amount: 12.5, frequency: 'WEEKLY' }, today)).toMatch(
      /at £12\.50 a week$/
    );
  });

  it('waits for what it needs', () => {
    expect(paidOffText({ ...figures, balance: null }, today)).toBe(
      'Shown once you add the balance'
    );
    expect(paidOffText({ ...figures, apr: null }, today)).toBe('Shown once you add the APR');
    expect(paidOffText({ ...figures, amount: null }, today)).toBe('Shown once you add the amount');
  });

  it('says when it is already paid off', () => {
    expect(paidOffText({ ...figures, balance: 0 }, today)).toBe('Already paid off');
  });
});
