import { describe, expect, it } from 'vitest';
import { formatLongDate } from '../dates';
import { formatLabel } from './formatLabel';
import { getInitials } from './initials';
import { formatBalance, formatMoney, formatPayment, parseMoney } from './money';

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

describe('formatLabel', () => {
  it('turns API enums into labels', () => {
    expect(formatLabel('ENGLAND_AND_WALES')).toBe('England & Wales');
    expect(formatLabel('FOUR_WEEKLY')).toBe('4 Weekly');
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
