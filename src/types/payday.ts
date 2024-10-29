import { BANK_HOLIDAY_REGION } from './bankHolidays';

export enum PAY_FREQUENCY {
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  FOUR_WEEKLY = 'FOUR_WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  BIANNUAL = 'BIANNUAL',
  ANNUAL = 'ANNUAL'
}

export enum PAYDAY_TYPE {
  LAST_DAY = 'LAST_DAY',
  LAST_FRIDAY = 'LAST_FRIDAY',
  SET_DAY = 'SET_DAY'
}

export interface PaydayConfig {
  frequency: PAY_FREQUENCY;
  type: PAYDAY_TYPE;
  dayOfMonth?: number;
  startDate?: string;
  bankHolidayRegion?: BANK_HOLIDAY_REGION;
}

export interface PaydayInfo {
  payday: Date;
  isPayday: boolean;
}
