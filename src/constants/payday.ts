import { PayFrequency } from '~/types';

export const PAY_FREQUENCY = {
  WEEKLY: 'WEEKLY',
  FORTNIGHTLY: 'FORTNIGHTLY',
  FOUR_WEEKLY: 'FOUR_WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  BIANNUAL: 'BIANNUAL',
  ANNUAL: 'ANNUAL'
} as const;

export const PAYDAY_TYPE = {
  LAST_DAY: 'LAST_DAY',
  LAST_FRIDAY: 'LAST_FRIDAY',
  SET_DAY: 'SET_DAY',
  SET_WEEKDAY: 'SET_WEEKDAY'
} as const;

export const WEEKDAY = {
  MONDAY: 'MONDAY',
  TUESDAY: 'TUESDAY',
  WEDNESDAY: 'WEDNESDAY',
  THURSDAY: 'THURSDAY',
  FRIDAY: 'FRIDAY',
  SATURDAY: 'SATURDAY',
  SUNDAY: 'SUNDAY'
} as const;

export const PAYDAY_TYPE_OPTIONS = {
  WEEKLY: [{ value: PAYDAY_TYPE.SET_WEEKDAY }],
  RECURRING: [
    { value: PAYDAY_TYPE.LAST_DAY },
    { value: PAYDAY_TYPE.LAST_FRIDAY },
    { value: PAYDAY_TYPE.SET_WEEKDAY }
  ],
  DEFAULT: [
    { value: PAYDAY_TYPE.LAST_DAY },
    { value: PAYDAY_TYPE.LAST_FRIDAY },
    { value: PAYDAY_TYPE.SET_DAY }
  ]
} as const;

export const PAYDAY_PERIOD_MAP: Record<PayFrequency, number> = {
  [PAY_FREQUENCY.WEEKLY]: 1,
  [PAY_FREQUENCY.FORTNIGHTLY]: 2,
  [PAY_FREQUENCY.FOUR_WEEKLY]: 4,
  [PAY_FREQUENCY.MONTHLY]: 1,
  [PAY_FREQUENCY.QUARTERLY]: 3,
  [PAY_FREQUENCY.BIANNUAL]: 6,
  [PAY_FREQUENCY.ANNUAL]: 12
};

export const PAYDAY_MONTH_FREQUENCIES: PayFrequency[] = [
  PAY_FREQUENCY.MONTHLY,
  PAY_FREQUENCY.QUARTERLY,
  PAY_FREQUENCY.BIANNUAL,
  PAY_FREQUENCY.ANNUAL
] as const;
