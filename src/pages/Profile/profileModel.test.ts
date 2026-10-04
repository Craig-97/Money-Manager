import { describe, expect, it } from 'vitest';
import { toIsoDate } from '~/lib/dates';
import {
  passwordStrength,
  paydayErrors,
  paydayPlan,
  paydayPreview,
  toPaydayInput,
  toPaydayValues,
  withFrequency
} from './profileModel';

describe('passwordStrength', () => {
  it('scores length, numbers, mixed case and symbols', () => {
    expect(passwordStrength('')).toEqual({ score: 0, label: '' });
    expect(passwordStrength('abc')).toEqual({ score: 0, label: 'Weak' });
    expect(passwordStrength('abcdefgh1')).toEqual({ score: 2, label: 'Fair' });
    expect(passwordStrength('Abcdefgh1')).toEqual({ score: 3, label: 'Good' });
    expect(passwordStrength('Abcdefgh1!')).toEqual({ score: 4, label: 'Strong' });
  });
});

describe('payday form', () => {
  const payday = {
    __typename: 'Payday' as const,
    id: 'p',
    frequency: 'MONTHLY' as const,
    type: 'SET_DAY' as const,
    dayOfMonth: 15,
    weekday: null,
    firstPayDate: null,
    bankHolidayRegion: 'SCOTLAND' as const
  };

  it('starts from the saved payday and saves only what the rule needs', () => {
    const values = toPaydayValues(payday);
    expect(values).toMatchObject({ rule: 'SET_DAY', dayOfMonth: '15', region: 'SCOTLAND' });
    expect(toPaydayInput(values)).toEqual({
      frequency: 'MONTHLY',
      type: 'SET_DAY',
      dayOfMonth: 15,
      weekday: null,
      firstPayDate: null,
      bankHolidayRegion: 'SCOTLAND'
    });
  });

  it('moves to a rule that suits a new frequency', () => {
    const weekly = withFrequency(toPaydayValues(payday), 'WEEKLY');
    expect(weekly.rule).toBe('SET_WEEKDAY');
    expect(paydayErrors(weekly).firstPayDate).toBe('Add the date of your next pay');
  });

  it('checks the day of the month', () => {
    expect(paydayErrors({ ...toPaydayValues(payday), dayOfMonth: '32' }).dayOfMonth).toBe(
      'Choose a day between 1 and 31'
    );
  });

  it('describes the plan', () => {
    expect(paydayPlan(payday)).toBe('Paid monthly · the 15th');
    expect(paydayPlan({ ...payday, type: 'LAST_FRIDAY' })).toBe('Paid monthly · last Friday');
    expect(
      paydayPlan({ ...payday, frequency: 'WEEKLY', type: 'SET_WEEKDAY', weekday: 'THURSDAY' })
    ).toBe('Paid weekly · Thursdays');
  });
});

describe('paydayPreview', () => {
  it('shows the next three paydays and which a bank holiday moved', () => {
    const preview = paydayPreview(
      { frequency: 'MONTHLY', type: 'LAST_FRIDAY' },
      new Set(['2026-12-25']),
      new Date(2026, 9, 4)
    );
    expect(preview.map(item => toIsoDate(item.date))).toEqual([
      '2026-10-30',
      '2026-11-27',
      '2026-12-24'
    ]);
    expect(preview[0].movedFrom).toBeNull();
    expect(toIsoDate(preview[2].movedFrom!)).toBe('2026-12-25');
  });
});
