import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPayday } from './dates';
import { PAY_FREQUENCY, PAYDAY_TYPE, WEEKDAY, BANK_HOLIDAY_REGION } from '~/constants';
import { Payday } from '~/types';

// Mock bank holidays utility
vi.mock('./bankHolidays', async importOriginal => {
  const actual = (await importOriginal()) as Record<string, unknown>;
  return {
    ...actual,
    getBankHolidays: vi.fn().mockResolvedValue([
      { title: 'Good Friday', date: '2024-03-29', notes: '', bunting: false },
      { title: 'Easter Monday', date: '2024-04-01', notes: '', bunting: false },
      { title: 'Early May Bank Holiday', date: '2024-05-06', notes: '', bunting: true },
      { title: 'Spring Bank Holiday', date: '2024-05-27', notes: '', bunting: true },
      { title: 'Summer Bank Holiday', date: '2024-08-26', notes: '', bunting: true },
      { title: 'Christmas Day', date: '2024-12-25', notes: '', bunting: false },
      { title: 'Boxing Day', date: '2024-12-26', notes: '', bunting: false }
    ])
  };
});

describe('getPayday', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockDate = (dateString: string) => new Date(dateString);

  // Base configs for each frequency type
  const baseWeeklyConfig: Payday = {
    frequency: PAY_FREQUENCY.WEEKLY,
    type: PAYDAY_TYPE.SET_WEEKDAY,
    weekday: WEEKDAY.FRIDAY,
    firstPayDate: '2024-03-11'
  };

  const baseRecurringConfig: Payday = {
    frequency: PAY_FREQUENCY.FORTNIGHTLY,
    type: PAYDAY_TYPE.LAST_DAY,
    firstPayDate: '2024-06-28'
  };

  // const baseMonthlyConfig: Payday = {
  //   frequency: PAY_FREQUENCY.MONTHLY,
  //   type: PAYDAY_TYPE.LAST_DAY
  // };

  // Test matrix for WEEKLY payments
  describe('Weekly Payments', () => {
    // Weekly only allows SET_WEEKDAY
    describe('SET_WEEKDAY type', () => {
      [
        WEEKDAY.MONDAY,
        WEEKDAY.TUESDAY,
        WEEKDAY.WEDNESDAY,
        WEEKDAY.THURSDAY,
        WEEKDAY.FRIDAY
      ].forEach(weekday => {
        describe(`${weekday} payments`, () => {
          const config = { ...baseWeeklyConfig, weekday };

          it('normal payment', async () => {
            // March 14, 2024 is a Thursday
            const result = await getPayday(mockDate('2024-03-14'), config);

            // Expected date should be the next occurrence of the specified weekday
            const expectedDates = {
              [WEEKDAY.MONDAY]: '2024-03-18',
              [WEEKDAY.TUESDAY]: '2024-03-19',
              [WEEKDAY.WEDNESDAY]: '2024-03-20',
              [WEEKDAY.THURSDAY]: '2024-03-21',
              [WEEKDAY.FRIDAY]: '2024-03-22'
            };
            expect(result.payday).toBe(expectedDates[weekday]);
          });

          it('handles bank holiday adjustments', async () => {
            const testCases = [
              {
                name: 'Easter period',
                mockDate: '2024-03-26',
                firstPayDate: '2024-03-18',
                expectedDates: {
                  [WEEKDAY.MONDAY]: '2024-03-28', // Easter Monday -> previous Thursday
                  [WEEKDAY.TUESDAY]: '2024-04-02',
                  [WEEKDAY.WEDNESDAY]: '2024-03-27',
                  [WEEKDAY.THURSDAY]: '2024-03-28',
                  [WEEKDAY.FRIDAY]: '2024-03-28' // Good Friday -> Thursday
                }
              },
              {
                name: 'Christmas period',
                mockDate: '2024-12-20',
                firstPayDate: '2024-12-16',
                expectedDates: {
                  [WEEKDAY.MONDAY]: '2024-12-23',
                  [WEEKDAY.TUESDAY]: '2024-12-24',
                  [WEEKDAY.WEDNESDAY]: '2024-12-24', // Christmas Day -> Tuesday
                  [WEEKDAY.THURSDAY]: '2024-12-24', // Boxing Day -> Tuesday
                  [WEEKDAY.FRIDAY]: '2024-12-27'
                }
              }
            ];

            for (const testCase of testCases) {
              const configWithRegion = {
                ...config,
                firstPayDate: testCase.firstPayDate,
                bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
              };

              const result = await getPayday(mockDate(testCase.mockDate), configWithRegion);
              expect(result.payday).toBe(testCase.expectedDates[weekday]);
            }
          });
        });
      });
    });
  });

  // Test matrix for FORTNIGHTLY and FOUR_WEEKLY payments
  [PAY_FREQUENCY.FORTNIGHTLY, PAY_FREQUENCY.FOUR_WEEKLY].forEach(frequency => {
    describe(`${frequency} Payments`, () => {
      describe('LAST_DAY type', () => {
        const config = { ...baseRecurringConfig, frequency };

        it('normal payment', async () => {
          const testCases = {
            [PAY_FREQUENCY.FORTNIGHTLY]: {
              mockDate: '2024-07-01',
              expectedDate: '2024-07-12' // Next fortnightly Friday
            },
            [PAY_FREQUENCY.FOUR_WEEKLY]: {
              mockDate: '2024-07-01',
              expectedDate: '2024-07-26' // Next four-weekly Friday
            }
          };

          const result = await getPayday(mockDate(testCases[frequency].mockDate), config);
          expect(result.payday).toBe(testCases[frequency].expectedDate);
        });

        it('bank holiday adjustment', async () => {
          const testCases = {
            [PAY_FREQUENCY.FORTNIGHTLY]: {
              mockDate: '2024-05-20',
              firstPayDate: '2024-05-16',
              expectedDate: '2024-05-30' // Thursday before Spring Bank Holiday
            },
            [PAY_FREQUENCY.FOUR_WEEKLY]: {
              mockDate: '2024-05-25',
              firstPayDate: '2024-05-02',
              expectedDate: '2024-05-30' // Thursday before Spring Bank Holiday
            }
          };

          const configWithRegion = {
            ...config,
            bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES,
            firstPayDate: testCases[frequency].firstPayDate
          };

          const result = await getPayday(mockDate(testCases[frequency].mockDate), configWithRegion);
          expect(result.payday).toBe(testCases[frequency].expectedDate);
        });
      });

      describe('LAST_FRIDAY type', () => {
        const config: Payday = {
          frequency,
          type: PAYDAY_TYPE.LAST_FRIDAY,
          firstPayDate: '2024-03-15'
        };

        it('normal payment', async () => {
          const testCases = {
            [PAY_FREQUENCY.FORTNIGHTLY]: {
              mockDate: '2024-03-18',
              expectedDate: '2024-03-29' // Next fortnightly last Friday
            },
            [PAY_FREQUENCY.FOUR_WEEKLY]: {
              mockDate: '2024-03-18',
              expectedDate: '2024-04-12' // Next four-weekly last Friday
            }
          };

          const result = await getPayday(mockDate(testCases[frequency].mockDate), config);
          expect(result.payday).toBe(testCases[frequency].expectedDate);
        });

        it('bank holiday adjustment', async () => {
          const testCases = {
            [PAY_FREQUENCY.FORTNIGHTLY]: {
              mockDate: '2024-03-18',
              firstPayDate: '2024-03-15',
              expectedDate: '2024-03-28' // Two weeks later, Good Friday moves to Thursday
            },
            [PAY_FREQUENCY.FOUR_WEEKLY]: {
              mockDate: '2024-03-18',
              firstPayDate: '2024-03-01',
              expectedDate: '2024-03-28' // Four weeks later, last Thursday (before bank holiday)
            }
          };

          const configWithRegion = {
            ...config,
            firstPayDate: testCases[frequency].firstPayDate,
            bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
          };

          const result = await getPayday(mockDate(testCases[frequency].mockDate), configWithRegion);
          expect(result.payday).toBe(testCases[frequency].expectedDate);
        });
      });

      // describe('SET_WEEKDAY type', () => {
      //   [
      //     WEEKDAY.MONDAY,
      //     WEEKDAY.TUESDAY,
      //     WEEKDAY.WEDNESDAY,
      //     WEEKDAY.THURSDAY,
      //     WEEKDAY.FRIDAY
      //   ].forEach(weekday => {
      //     describe(`${weekday} payments`, () => {
      //       const config: Payday = {
      //         frequency,
      //         type: PAYDAY_TYPE.SET_WEEKDAY,
      //         weekday,
      //         firstPayDate: '2024-03-15'
      //       };

      //       it('normal recurring payment', async () => {
      //         const result = await getPayday(mockDate('2024-03-14'), config);
      //         // Expected dates for next occurrence based on firstPayDate
      //         const expectedDates = {
      //           [WEEKDAY.MONDAY]: '2024-03-25',
      //           [WEEKDAY.TUESDAY]: '2024-03-26',
      //           [WEEKDAY.WEDNESDAY]: '2024-03-27',
      //           [WEEKDAY.THURSDAY]: '2024-03-28',
      //           [WEEKDAY.FRIDAY]: '2024-03-29'
      //         };
      //         expect(result.payday).toBe(expectedDates[weekday]);
      //       });

      //       it('bank holiday adjustment', async () => {
      //         // Testing Easter period
      //         const configWithRegion = {
      //           ...config,
      //           bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES,
      //           firstPayDate: '2024-03-29' // Good Friday
      //         };
      //         const result = await getPayday(mockDate('2024-03-28'), configWithRegion);

      //         // All bank holiday dates should move to previous working day
      //         const expectedDates = {
      //           [WEEKDAY.MONDAY]: '2024-03-28', // Easter Monday moves to previous Thursday
      //           [WEEKDAY.TUESDAY]: '2024-04-09',
      //           [WEEKDAY.WEDNESDAY]: '2024-04-10',
      //           [WEEKDAY.THURSDAY]: '2024-04-11',
      //           [WEEKDAY.FRIDAY]: '2024-03-28' // Good Friday moves to Thursday
      //         };
      //         expect(result.payday).toBe(expectedDates[weekday]);
      //       });

      //       it('multiple bank holidays adjustment', async () => {
      //         // Testing Christmas period
      //         const configWithRegion = {
      //           ...config,
      //           bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES,
      //           firstPayDate: '2024-12-25' // Christmas Day
      //         };
      //         const result = await getPayday(mockDate('2024-12-24'), configWithRegion);

      //         const expectedDates = {
      //           [WEEKDAY.MONDAY]: '2024-12-23',
      //           [WEEKDAY.TUESDAY]: '2024-12-24',
      //           [WEEKDAY.WEDNESDAY]: '2024-12-24', // Christmas Day moves to Tuesday
      //           [WEEKDAY.THURSDAY]: '2024-12-24', // Boxing Day moves to Tuesday
      //           [WEEKDAY.FRIDAY]: '2024-12-27'
      //         };
      //         expect(result.payday).toBe(expectedDates[weekday]);
      //       });
      //     });
      //   });
      // });
    });
  });

  // // Test matrix for MONTHLY, QUARTERLY, BIANNUAL, and ANNUAL payments
  // [
  //   PAY_FREQUENCY.MONTHLY,
  //   PAY_FREQUENCY.QUARTERLY,
  //   PAY_FREQUENCY.BIANNUAL,
  //   PAY_FREQUENCY.ANNUAL
  // ].forEach(frequency => {
  //   describe(`${frequency} Payments`, () => {
  //     describe('LAST_DAY type', () => {
  //       const config = { ...baseMonthlyConfig, frequency };

  //       it('normal payment - 31 day month', async () => {
  //         // March 31, 2024 is a Sunday
  //         const result = await getPayday(mockDate('2024-03-14'), config);
  //         expect(result.payday).toBe('2024-03-29'); // Moves to Friday
  //       });

  //       it('normal payment - 30 day month', async () => {
  //         // April 30, 2024 is a Tuesday
  //         const result = await getPayday(mockDate('2024-04-14'), config);
  //         expect(result.payday).toBe('2024-04-30');
  //       });

  //       it('bank holiday adjustment', async () => {
  //         // May 31, 2024 is a Friday
  //         const configWithRegion = {
  //           ...config,
  //           bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
  //         };
  //         const result = await getPayday(mockDate('2024-05-30'), configWithRegion);
  //         expect(result.payday).toBe('2024-05-31'); // Regular Friday, not a bank holiday
  //       });
  //     });

  //     describe('LAST_FRIDAY type', () => {
  //       const config: Payday = {
  //         frequency,
  //         type: PAYDAY_TYPE.LAST_FRIDAY
  //       };

  //       it('normal payment', async () => {
  //         // Last Friday of March 2024 is March 29 (Good Friday)
  //         const result = await getPayday(mockDate('2024-03-14'), config);
  //         expect(result.payday).toBe('2024-03-29');
  //       });

  //       it('bank holiday adjustment', async () => {
  //         // March 29, 2024 is Good Friday
  //         const configWithRegion = {
  //           ...config,
  //           bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
  //         };
  //         const result = await getPayday(mockDate('2024-03-28'), configWithRegion);
  //         expect(result.payday).toBe('2024-03-28'); // Moves to Thursday
  //       });
  //     });

  //     describe('SET_DAY type', () => {
  //       [1, 15, 28, 31].forEach(dayOfMonth => {
  //         describe(`Day ${dayOfMonth} payments`, () => {
  //           const config: Payday = {
  //             frequency,
  //             type: PAYDAY_TYPE.SET_DAY,
  //             dayOfMonth
  //           };

  //           it('normal payment', async () => {
  //             const result = await getPayday(mockDate('2024-03-01'), config);
  //             // March 15 is a Friday
  //             // March 31 is a Sunday -> Should move to March 29 (except it's Good Friday)
  //             const expectedDate =
  //               dayOfMonth === 31
  //                 ? '2024-03-28'
  //                 : `2024-03-${dayOfMonth.toString().padStart(2, '0')}`;
  //             expect(result.payday).toBe(expectedDate);
  //           });

  //           it('weekend adjustment', async () => {
  //             // Testing June 2024 where 15th is a Saturday
  //             const result = await getPayday(mockDate('2024-06-01'), config);
  //             const expectedDates: Record<number, string> = {
  //               1: '2024-06-03', // Saturday -> Monday
  //               15: '2024-06-14', // Saturday -> Friday
  //               28: '2024-06-28', // Friday
  //               31: '2024-06-28' // Sunday -> Friday
  //             };
  //             expect(result.payday).toBe(expectedDates[dayOfMonth]);
  //           });

  //           it('bank holiday adjustment', async () => {
  //             // Testing April 2024 (Easter Monday on 1st)
  //             const configWithRegion = {
  //               ...config,
  //               bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
  //             };
  //             const result = await getPayday(mockDate('2024-04-01'), configWithRegion);
  //             const expectedDates: Record<number, string> = {
  //               1: '2024-03-28', // Easter Monday -> Previous Thursday
  //               15: '2024-04-15', // Regular Monday
  //               28: '2024-04-26', // Sunday -> Friday
  //               31: '2024-04-30' // Regular Tuesday
  //             };
  //             expect(result.payday).toBe(expectedDates[dayOfMonth]);
  //           });

  //           it('multiple bank holidays adjustment', async () => {
  //             // Testing December 2024 (Christmas and Boxing Day)
  //             const configWithRegion = {
  //               ...config,
  //               bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
  //             };
  //             const result = await getPayday(mockDate('2024-12-24'), configWithRegion);
  //             const expectedDates: Record<number, string> = {
  //               1: '2024-12-02', // Sunday -> Monday
  //               15: '2024-12-13', // Sunday -> Friday
  //               28: '2024-12-27', // Saturday -> Friday
  //               31: '2024-12-24' // Tuesday (before Christmas)
  //             };
  //             expect(result.payday).toBe(expectedDates[dayOfMonth]);
  //           });
  //         });
  //       });
  //     });
  //   });
  // });

  //   // Edge cases that should be tested for all combinations
  //   describe('Edge Cases', () => {
  //     it('should handle leap year February', async () => {
  //       const configs = [
  //         // Weekly payment on Feb 29
  //         {
  //           frequency: PAY_FREQUENCY.WEEKLY,
  //           type: PAYDAY_TYPE.SET_WEEKDAY,
  //           weekday: WEEKDAY.THURSDAY,
  //           firstPayDate: '2024-02-29'
  //         },
  //         // Monthly payment on Feb 29
  //         {
  //           frequency: PAY_FREQUENCY.MONTHLY,
  //           type: PAYDAY_TYPE.SET_DAY,
  //           dayOfMonth: 29
  //         },
  //         // Last day of February in leap year
  //         {
  //           frequency: PAY_FREQUENCY.MONTHLY,
  //           type: PAYDAY_TYPE.LAST_DAY
  //         }
  //       ];

  //       // Feb 29, 2024 is a Thursday
  //       for (const config of configs) {
  //         const result = await getPayday(mockDate('2024-02-01'), config);
  //         expect(result.payday).toBe('2024-02-29');
  //       }

  //       // Test non-leap year (2025)
  //       const result = await getPayday(
  //         mockDate('2025-02-01'),
  //         { frequency: PAY_FREQUENCY.MONTHLY, type: PAYDAY_TYPE.LAST_DAY }
  //       );
  //       expect(result.payday).toBe('2025-02-28'); // Friday
  //     });

  //     it('should handle year transition', async () => {
  //       const configs = [
  //         // Weekly payment over New Year
  //         {
  //           frequency: PAY_FREQUENCY.WEEKLY,
  //           type: PAYDAY_TYPE.SET_WEEKDAY,
  //           weekday: WEEKDAY.MONDAY,
  //           firstPayDate: '2023-12-25'
  //         },
  //         // Monthly payment in December
  //         {
  //           frequency: PAY_FREQUENCY.MONTHLY,
  //           type: PAYDAY_TYPE.LAST_DAY
  //         },
  //         // Fortnightly payment over New Year
  //         {
  //           frequency: PAY_FREQUENCY.FORTNIGHTLY,
  //           type: PAYDAY_TYPE.SET_WEEKDAY,
  //           weekday: WEEKDAY.FRIDAY,
  //           firstPayDate: '2023-12-29'
  //         }
  //       ];

  //       // Dec 31, 2023 is a Sunday
  //       // Dec 25, 2023 is a Monday (Christmas)
  //       // Dec 29, 2023 is a Friday
  //       const expectations = [
  //         '2023-12-22', // Monday is Christmas, moves to previous Friday
  //         '2023-12-29', // Sunday 31st moves to Friday
  //         '2023-12-29'  // Regular Friday
  //       ];

  //       for (let i = 0; i < configs.length; i++) {
  //         const result = await getPayday(mockDate('2023-12-21'), configs[i]);
  //         expect(result.payday).toBe(expectations[i]);
  //       }
  //     });

  //     it('should handle month with fewer days than specified', async () => {
  //       const configs = [
  //         // Monthly payment set to 31st
  //         {
  //           frequency: PAY_FREQUENCY.MONTHLY,
  //           type: PAYDAY_TYPE.SET_DAY,
  //           dayOfMonth: 31
  //         },
  //         // Quarterly payment set to 31st
  //         {
  //           frequency: PAY_FREQUENCY.QUARTERLY,
  //           type: PAYDAY_TYPE.SET_DAY,
  //           dayOfMonth: 31
  //         }
  //       ];

  //       // Test for April (30 days)
  //       for (const config of configs) {
  //         const result = await getPayday(mockDate('2024-04-01'), config);
  //         expect(result.payday).toBe('2024-04-30'); // Tuesday
  //       }

  //       // Test for February (non-leap year)
  //       for (const config of configs) {
  //         const result = await getPayday(mockDate('2025-02-01'), config);
  //         expect(result.payday).toBe('2025-02-28'); // Friday
  //       }
  //     });

  //     it('should handle multiple bank holidays in sequence', async () => {
  //       const configs = [
  //         // Easter period (Good Friday + Easter Monday)
  //         {
  //           frequency: PAY_FREQUENCY.WEEKLY,
  //           type: PAYDAY_TYPE.SET_WEEKDAY,
  //           weekday: WEEKDAY.FRIDAY,
  //           firstPayDate: '2024-03-29',
  //           bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
  //         },
  //         // Christmas period (Christmas Day + Boxing Day)
  //         {
  //           frequency: PAY_FREQUENCY.MONTHLY,
  //           type: PAYDAY_TYPE.SET_DAY,
  //           dayOfMonth: 25,
  //           bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
  //         }
  //       ];

  //       // Easter period test (Good Friday is March 29)
  //       const easterResult = await getPayday(mockDate('2024-03-28'), configs[0]);
  //       expect(easterResult.payday).toBe('2024-03-28'); // Thursday before Good Friday

  //       // Christmas period test (Christmas is Wednesday)
  //       const christmasResult = await getPayday(mockDate('2024-12-24'), configs[1]);
  //       expect(christmasResult.payday).toBe('2024-12-24'); // Tuesday before Christmas
  //     });

  //     it('should handle first pay date in past vs future', async () => {
  //       const config = {
  //         frequency: PAY_FREQUENCY.FORTNIGHTLY,
  //         type: PAYDAY_TYPE.SET_WEEKDAY,
  //         weekday: WEEKDAY.FRIDAY,
  //         firstPayDate: '2024-03-15'
  //       };

  //       // First pay date is in future
  //       const futureResult = await getPayday(mockDate('2024-03-01'), config);
  //       expect(futureResult.payday).toBe('2024-03-15'); // Regular Friday

  //       // First pay date is in past
  //       const pastResult = await getPayday(mockDate('2024-03-16'), config);
  //       expect(pastResult.payday).toBe('2024-03-29'); // Next fortnightly Friday
  //     });

  //     it('should handle bank holidays across year boundaries', async () => {
  //       const config = {
  //         frequency: PAY_FREQUENCY.WEEKLY,
  //         type: PAYDAY_TYPE.SET_WEEKDAY,
  //         weekday: WEEKDAY.MONDAY,
  //         firstPayDate: '2024-01-01',
  //         bankHolidayRegion: BANK_HOLIDAY_REGION.ENGLAND_AND_WALES
  //       };

  //       // New Year's Day 2024 is a Monday and a bank holiday
  //       const result = await getPayday(mockDate('2023-12-31'), config);
  //       expect(result.payday).toBe('2023-12-29'); // Previous Friday
  //     });
  //   });
});
