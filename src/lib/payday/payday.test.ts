import { describe, expect, it } from 'vitest';
import { PaydayConfig, toIsoDate } from '~/lib/dates';
import { getNextPaydays, getPayCycle } from './payday';

const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};

const NO_HOLIDAYS = new Set<string>();

const cycle = (config: PaydayConfig, today: string, holidays = NO_HOLIDAYS) => {
  const { start, end, isPayday } = getPayCycle(config, holidays, day(today));
  return { start: toIsoDate(start), end: toIsoDate(end), isPayday };
};

describe('getPayCycle', () => {
  it('runs from the last payday to the next for last-Friday pay', () => {
    expect(
      cycle({ frequency: 'MONTHLY', type: 'LAST_WEEKDAY', weekday: 'FRIDAY' }, '2026-10-02')
    ).toEqual({
      start: '2026-09-25',
      end: '2026-10-30',
      isPayday: false
    });
  });

  it('finds the last Thursday of the month', () => {
    // Last Thursdays: 24 Sep, 29 Oct (the 31st is a Saturday), 26 Nov 2026
    const config: PaydayConfig = {
      frequency: 'MONTHLY',
      type: 'LAST_WEEKDAY',
      weekday: 'THURSDAY'
    };
    expect(cycle(config, '2026-10-02')).toEqual({
      start: '2026-09-24',
      end: '2026-10-29',
      isPayday: false
    });
    expect(cycle(config, '2026-10-29')).toMatchObject({ start: '2026-10-29', isPayday: true });
    expect(cycle(config, '2026-10-30').end).toBe('2026-11-26');
  });

  it('uses the last day itself when it is the chosen weekday', () => {
    // 30 Apr 2026 is a Thursday
    const config: PaydayConfig = {
      frequency: 'MONTHLY',
      type: 'LAST_WEEKDAY',
      weekday: 'THURSDAY'
    };
    expect(cycle(config, '2026-04-10').end).toBe('2026-04-30');
  });

  it('moves a last working day off the weekend', () => {
    // 31 Oct 2026 is a Saturday
    expect(cycle({ frequency: 'MONTHLY', type: 'LAST_DAY' }, '2026-10-02')).toMatchObject({
      start: '2026-09-30',
      end: '2026-10-30'
    });
  });

  it('moves payday off a bank holiday to the working day before', () => {
    const holidays = new Set(['2026-12-25']);
    expect(
      cycle(
        { frequency: 'MONTHLY', type: 'LAST_WEEKDAY', weekday: 'FRIDAY' },
        '2026-12-01',
        holidays
      ).end
    ).toBe('2026-12-24');
  });

  it('uses the end of shorter months for a set day', () => {
    // 28 Feb 2027 is a Sunday, so pay comes on Friday 26th
    expect(cycle({ frequency: 'MONTHLY', type: 'SET_DAY', dayOfMonth: 31 }, '2027-02-10').end).toBe(
      '2027-02-26'
    );
  });

  it('knows when today is payday, with the cycle running to the next one', () => {
    expect(
      cycle({ frequency: 'MONTHLY', type: 'LAST_WEEKDAY', weekday: 'FRIDAY' }, '2026-10-30')
    ).toEqual({
      start: '2026-10-30',
      end: '2026-11-27',
      isPayday: true
    });
  });

  it('counts weekly pay from the first pay date on the chosen weekday', () => {
    const weekly: PaydayConfig = {
      frequency: 'WEEKLY',
      type: 'SET_WEEKDAY',
      weekday: 'FRIDAY',
      firstPayDate: '2026-01-01'
    };
    expect(cycle(weekly, '2026-10-07')).toMatchObject({ start: '2026-10-02', end: '2026-10-09' });
  });

  it('counts fortnightly pay from the first pay date', () => {
    const fortnightly: PaydayConfig = {
      frequency: 'FORTNIGHTLY',
      type: 'SET_WEEKDAY',
      weekday: 'FRIDAY',
      firstPayDate: '2026-01-02'
    };
    expect(cycle(fortnightly, '2026-10-02')).toMatchObject({
      start: '2026-09-25',
      end: '2026-10-09'
    });
  });

  it('counts quarterly pay from the month of the first pay date', () => {
    const quarterly: PaydayConfig = {
      frequency: 'QUARTERLY',
      type: 'LAST_DAY',
      firstPayDate: '2026-03-31'
    };
    expect(cycle(quarterly, '2026-10-02')).toMatchObject({
      start: '2026-09-30',
      end: '2026-12-31'
    });
  });

  it('reads a first pay date in the API format too', () => {
    const weekly: PaydayConfig = {
      frequency: 'WEEKLY',
      type: 'SET_WEEKDAY',
      weekday: 'FRIDAY',
      firstPayDate: String(Date.UTC(2026, 0, 2))
    };
    expect(cycle(weekly, '2026-10-07').start).toBe('2026-10-02');
  });
});

describe('getNextPaydays', () => {
  it('lists the next paydays from a date', () => {
    const next = getNextPaydays(
      { frequency: 'MONTHLY', type: 'LAST_DAY' },
      NO_HOLIDAYS,
      day('2026-10-02'),
      2
    );
    expect(next.map(toIsoDate)).toEqual(['2026-10-30', '2026-11-30']);
  });
});
