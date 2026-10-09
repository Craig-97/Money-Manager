import { PayFrequency, PaydayType } from '~/graphql/generated';

// `satisfies` keeps these in step with the API's enums, so a value the API rejects won't compile
export const PAY_FREQUENCY = {
  WEEKLY: 'WEEKLY',
  FORTNIGHTLY: 'FORTNIGHTLY',
  FOUR_WEEKLY: 'FOUR_WEEKLY',
  MONTHLY: 'MONTHLY',
  QUARTERLY: 'QUARTERLY',
  BIANNUAL: 'BIANNUAL',
  ANNUAL: 'ANNUAL'
} as const satisfies { [K in PayFrequency]: K };

export const PAYDAY_TYPE = {
  LAST_DAY: 'LAST_DAY',
  LAST_WEEKDAY: 'LAST_WEEKDAY',
  SET_DAY: 'SET_DAY',
  SET_WEEKDAY: 'SET_WEEKDAY'
} as const satisfies { [K in PaydayType]: K };
