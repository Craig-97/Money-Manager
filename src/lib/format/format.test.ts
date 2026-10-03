import { describe, expect, it } from 'vitest';
import { formatLongDate } from '../dates';
import { formatLabel } from './formatLabel';
import { getInitials } from './initials';

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
