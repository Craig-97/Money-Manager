import { describe, expect, it } from 'vitest';
import { formatLongDate } from '../dates';
import { getInitials } from './initials';
import { joinNames } from './joinNames';
import { formatBalance, formatMoney, formatPayment, parseMoney } from './money';
import { ordinal } from './ordinal';
import { plural } from './plural';

describe('getInitials', () => {
  it('takes the first letter of each name', () => {
    expect(getInitials('Test', 'Account')).toBe('TA');
    expect(getInitials(' craig ', 'baxter')).toBe('CB');
  });

  it('skips missing names', () => {
    expect(getInitials(undefined, null)).toBe('');
    expect(getInitials('Test', undefined)).toBe('T');
  });
});

describe('ordinal', () => {
  it('adds the suffix, with 11th to 13th as teens', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 23, 31].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '23rd',
      '31st'
    ]);
  });
});

describe('formatLongDate', () => {
  const date = new Date('2026-10-02T12:00:00Z');

  it('formats like the design header', () => {
    expect(formatLongDate(date)).toBe('Friday 2 October 2026');
    expect(formatLongDate(date, { withYear: false })).toBe('Friday 2 October');
  });

  it('uses the UK date just after midnight in summer time', () => {
    expect(formatLongDate(new Date('2026-10-02T23:30:00Z'))).toBe('Saturday 3 October 2026');
  });
});

describe('money', () => {
  it('formats amounts the way the design shows them', () => {
    expect(formatMoney(-1234.5)).toBe('£1,234.50');
    expect(formatMoney(328.4, { whole: true })).toBe('£328');
    expect(formatBalance(-12.5)).toBe('−£12.50');
    expect(formatPayment(10)).toBe('+£10.00');
    expect(formatPayment(-750)).toBe('£750.00');
  });

  it('reads amounts typed into a field', () => {
    expect(parseMoney('£1,234.56')).toBe(1234.56);
    expect(parseMoney(' 20 ')).toBe(20);
    expect(parseMoney('.5')).toBe(0.5);
    expect(parseMoney('12.345')).toBeNull();
    expect(parseMoney('abc')).toBeNull();
    expect(parseMoney('')).toBeNull();
  });
});

describe('plural', () => {
  it('adds an s for any count but one', () => {
    expect(plural(1, 'month')).toBe('1 month');
    expect(plural(0, 'note')).toBe('0 notes');
    expect(plural(3, 'recurring payment')).toBe('3 recurring payments');
  });
});

describe('joinNames', () => {
  it('lists names as a sentence would', () => {
    expect(joinNames([])).toBe('');
    expect(joinNames(['Netflix'])).toBe('Netflix');
    expect(joinNames(['Netflix', 'Gym'])).toBe('Netflix and Gym');
    expect(joinNames(['Netflix', 'Gym', 'Phone'])).toBe('Netflix, Gym and Phone');
  });
});
