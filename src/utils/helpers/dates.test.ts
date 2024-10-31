import { describe, it, expect, vi } from 'vitest';
import { getPayday } from './dates';
import { PAY_FREQUENCY, PAYDAY_TYPE, WEEKDAY } from '~/constants';
import { PaydayConfig } from '~/types';

vi.mock('./bankHolidays', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getBankHolidays: vi.fn().mockResolvedValue([
      { date: '2024-01-01', title: "New Year's Day" },
      { date: '2024-03-29', title: 'Good Friday' },
      { date: '2024-05-27', title: 'Spring Bank Holiday' }
    ])
  };
});

describe('getPayday', () => {
  const baseConfig: PaydayConfig = {
    frequency: PAY_FREQUENCY.MONTHLY,
    type: PAYDAY_TYPE.LAST_DAY,
    bankHolidayRegion: 'england-and-wales'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('with firstPayDate', () => {
    it('should return firstPayDate if it is in the future', async () => {
      const today = new Date('2024-01-15');
      const config = {
        ...baseConfig,
        firstPayDate: '2024-01-31'
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-01-31');
      expect(result.isPayday).toBe(false);
    });

    it('should adjust firstPayDate if it falls on a weekend', async () => {
      const today = new Date('2024-01-15');
      const config = {
        ...baseConfig,
        firstPayDate: '2024-02-03' // Saturday
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-02-02'); // Friday
      expect(result.isPayday).toBe(false);
    });

    it('should adjust firstPayDate if it falls on a bank holiday', async () => {
      const today = new Date('2024-05-15');
      const config = {
        ...baseConfig,
        firstPayDate: '2024-05-27' // Spring Bank Holiday
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-05-24'); // Next payday
      expect(result.isPayday).toBe(false);
    });
  });

  describe('Monthly Pay Frequency', () => {
    it('should handle last day of month', async () => {
      const today = new Date('2024-01-15');
      const config = {
        ...baseConfig,
        type: PAYDAY_TYPE.LAST_DAY
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-01-31');
      expect(result.isPayday).toBe(false);
    });

    it('should handle last Friday', async () => {
      const today = new Date('2024-01-15');
      const config = {
        ...baseConfig,
        type: PAYDAY_TYPE.LAST_FRIDAY
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-01-26');
      expect(result.isPayday).toBe(false);
    });

    it('should handle set day of month', async () => {
      const today = new Date('2024-01-15');
      const config = {
        ...baseConfig,
        type: PAYDAY_TYPE.SET_DAY,
        dayOfMonth: 26
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-01-26');
      expect(result.isPayday).toBe(false);
    });
  });

  describe('Weekly Pay Frequency', () => {
    const weeklyConfig = {
      ...baseConfig,
      frequency: PAY_FREQUENCY.WEEKLY,
      type: PAYDAY_TYPE.SET_WEEKDAY,
      weekday: WEEKDAY.FRIDAY,
      firstPayDate: '2024-01-19'
    };

    it('should return next weekly payday', async () => {
      const today = new Date('2024-01-15');
      const result = await getPayday(today, weeklyConfig);
      expect(result.payday).toBe('2024-01-19');
      expect(result.isPayday).toBe(false);
    });

    it('should adjust for bank holidays', async () => {
      const today = new Date('2024-03-25');
      const result = await getPayday(today, weeklyConfig);
      expect(result.payday).toBe('2024-03-28'); // Good Friday adjusted to Thursday
      expect(result.isPayday).toBe(false);
    });
  });
  describe('Other Pay Frequencies', () => {
    const testCases = [
      {
        freq: PAY_FREQUENCY.FORTNIGHTLY,
        firstPay: '2024-01-31',
        nextPay: '2024-02-14',
        description: 'should add 14 days'
      }
      //   {
      //   freq: PAY_FREQUENCY.FOUR_WEEKLY,
      //   firstPay: '2024-01-31',
      //   nextPay: '2024-02-28',
      //   description: 'should add 28 days'
      // },
      // {
      //   freq: PAY_FREQUENCY.QUARTERLY,
      //   firstPay: '2024-01-31',
      //   nextPay: '2024-04-30',
      //   description: 'should add 3 months'
      // },
      // {
      //   freq: PAY_FREQUENCY.BIANNUAL,
      //   firstPay: '2024-01-31',
      //   nextPay: '2024-07-31',
      //   description: 'should add 6 months'
      // },
      // {
      //   freq: PAY_FREQUENCY.ANNUAL,
      //   firstPay: '2024-01-31',
      //   nextPay: '2025-01-31',
      //   description: 'should add 12 months'
      // }
    ];

    testCases.forEach(({ freq, firstPay, nextPay, description }) => {
      describe(`${freq} frequency`, () => {
        const config = {
          ...baseConfig,
          frequency: freq,
          firstPayDate: firstPay
        };

        it(`should calculate next ${freq.toLowerCase()} payday`, async () => {
          const today = new Date('2024-01-15');
          const result = await getPayday(today, config);
          expect(result.payday).toBe(firstPay);
          expect(result.isPayday).toBe(false);
        });

        it(`should calculate subsequent ${freq.toLowerCase()} payday (${description})`, async () => {
          const today = new Date('2024-02-01');
          const result = await getPayday(today, config);
          expect(result.payday).toBe(nextPay);
          expect(result.isPayday).toBe(false);
        });

        it(`should adjust ${freq.toLowerCase()} payday for weekends and holidays`, async () => {
          const config = {
            ...baseConfig,
            frequency: freq,
            firstPayDate: '2024-05-27' // Spring Bank Holiday
          };

          const today = new Date('2024-05-15');
          const result = await getPayday(today, config);
          expect(result.payday).toBe('2024-05-24'); // Adjusted to previous working day
          expect(result.isPayday).toBe(false);
        });
      });
    });
  });

  describe('weekend and bank holiday adjustments', () => {
    it('should adjust last day when it falls on weekend', async () => {
      const today = new Date('2024-06-15');
      const config = {
        ...baseConfig,
        type: PAYDAY_TYPE.LAST_DAY
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-06-27'); // Last day is Sunday 30th, adjusted to Friday 27th
      expect(result.isPayday).toBe(false);
    });

    it('should adjust last Friday when it falls on bank holiday', async () => {
      const today = new Date('2024-03-15');
      const config = {
        ...baseConfig,
        type: PAYDAY_TYPE.LAST_FRIDAY
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-03-28'); // Last Friday is Good Friday, adjusted to Thursday
      expect(result.isPayday).toBe(false);
    });

    it('should adjust set day when it falls on weekend', async () => {
      const today = new Date('2024-02-15');
      const config = {
        ...baseConfig,
        type: PAYDAY_TYPE.SET_DAY,
        dayOfMonth: 24 // Falls on Saturday
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-02-23'); // Adjusted to Friday
      expect(result.isPayday).toBe(false);
    });

    it('should adjust set weekday when it falls on bank holiday', async () => {
      const today = new Date('2024-05-23');
      const config = {
        ...baseConfig,
        frequency: PAY_FREQUENCY.FORTNIGHTLY,
        type: PAYDAY_TYPE.SET_WEEKDAY,
        weekday: WEEKDAY.MONDAY,
        firstPayDate: '2024-04-15'
      };

      const result = await getPayday(today, config);
      expect(result.payday).toBe('2024-05-24'); // Monday 27th is Spring Bank Holiday, adjusted to Friday
      expect(result.isPayday).toBe(false);
    });
  });
});
