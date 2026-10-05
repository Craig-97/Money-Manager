import { describe, expect, it } from 'vitest';
import { toIsoDate } from '~/lib/dates';
import {
  axisLabel,
  chartScale,
  defaultSpend,
  impactText,
  monthRows,
  project,
  spendHelper
} from './forecastModel';

describe('project', () => {
  // The design's example: £9,165 free now, £3,600 income, £770 recurring, spending £1,000
  const projection = project({ start: 9165, income: 3600, spend: 1000, recurring: 770 });

  it('adds what is left after spending to the balance each month', () => {
    expect(projection.net).toBe(2600);
    expect(projection.atSpend[1]).toBe(11765);
    expect(projection.inAYear).toBe(9165 + 2600 * 12);
    expect(projection.recurringOnly[12]).toBe(9165 + 2830 * 12);
  });

  it('gives growth as a share of what is free now', () => {
    expect(projection.growthPercent).toBeCloseTo(28.37, 2);
    expect(project({ start: 0, income: 1, spend: 0, recurring: 0 }).growthPercent).toBeNull();
  });
});

describe('chartScale', () => {
  it('uses round steps with at most six gridlines', () => {
    expect(chartScale([9165, 40365])).toEqual({
      min: 0,
      max: 50000,
      lines: [0, 10000, 20000, 30000, 40000, 50000]
    });
  });

  it('goes below zero for a balance heading overdrawn', () => {
    const { min, lines } = chartScale([500, -1800]);
    expect(min).toBeLessThan(0);
    expect(lines).toContain(0);
  });

  it('labels the axis in thousands', () => {
    expect(axisLabel(0)).toBe('£0');
    expect(axisLabel(20000)).toBe('£20k');
    expect(axisLabel(-5000)).toBe('−£5k');
  });
});

describe('spend text', () => {
  it('compares the spend with recurring payments', () => {
    expect(spendHelper(1000, 770)).toBe('you’d spend £230 more each month.');
    expect(impactText(1000, 770)).toContain('£2,760 lower after 12 months');
    expect(impactText(770, 770)).toBe(
      'You’re spending exactly your recurring payments, so both lines match.'
    );
  });

  it('starts the slider at the next £500 above recurring payments', () => {
    expect(defaultSpend(770, 3600)).toBe(1000);
    expect(defaultSpend(0, 3600)).toBe(500);
    expect(defaultSpend(2900, 3000)).toBe(3000);
  });
});

describe('monthRows', () => {
  const rows = monthRows({
    today: new Date(2026, 9, 2),
    start: 9165,
    net: 2600,
    income: 3600,
    afterPayday: false,
    payday: { frequency: 'MONTHLY', type: 'LAST_WEEKDAY', weekday: 'FRIDAY' },
    holidays: new Set(['2026-12-25'])
  });

  it('lists 24 months from this one, with each month’s payday', () => {
    expect(rows).toHaveLength(24);
    expect(rows[0]).toMatchObject({
      month: 'October 2026',
      isNow: true,
      balance: 9165,
      change: null
    });
    expect(toIsoDate(rows[0].payday!)).toBe('2026-10-30');
    expect(rows[1].balance).toBe(11765);
  });

  it('flags a payday moved by a bank holiday', () => {
    const december = rows[2];
    expect(toIsoDate(december.payday!)).toBe('2026-12-24');
    expect(toIsoDate(december.movedFrom!)).toBe('2026-12-25');
    expect(rows[0].movedFrom).toBeNull();
    expect(december.movedBy).toBe('bank holiday');
  });

  it('flags a payday the user moved, apart from bank holidays', () => {
    const moved = monthRows({
      today: new Date(2026, 9, 2),
      start: 9165,
      net: 2600,
      income: 3600,
      afterPayday: false,
      payday: {
        frequency: 'MONTHLY',
        type: 'LAST_WEEKDAY',
        weekday: 'FRIDAY',
        overrides: [{ for: '2026-12-24', date: '2026-12-17' }]
      },
      holidays: new Set(['2026-12-25'])
    });
    expect(toIsoDate(moved[2].payday!)).toBe('2026-12-17');
    expect(toIsoDate(moved[2].movedFrom!)).toBe('2026-12-24');
    expect(moved[2].movedBy).toBe('you');
    expect(moved[1].movedBy).toBeNull();
  });
});
