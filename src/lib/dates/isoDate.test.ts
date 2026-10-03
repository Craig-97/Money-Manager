import { describe, expect, it } from 'vitest';
import { formatPickerDate, parseIsoDate, toIsoDate } from './isoDate';

describe('ISO dates', () => {
  it('reads a YYYY-MM-DD string as that day in local time', () => {
    const date = parseIsoDate('2026-10-02')!;

    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 9, 2, 0
    ]);
  });

  it('rejects text that is not a real date', () => {
    expect(parseIsoDate('')).toBeUndefined();
    expect(parseIsoDate(undefined)).toBeUndefined();
    expect(parseIsoDate('02/10/2026')).toBeUndefined();
    expect(parseIsoDate('2026-02-30')).toBeUndefined();
  });

  it('writes a date back the same way', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toIsoDate(parseIsoDate('2026-12-31')!)).toBe('2026-12-31');
  });

  it('formats like the design date fields', () => {
    expect(formatPickerDate(new Date(2026, 9, 2))).toBe('Fri 2 Oct 2026');
  });
});
