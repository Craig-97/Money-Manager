import { PAY_FREQUENCY, PAYDAY_TYPE, WEEKDAY } from '~/constants';
import { BankHolidayRegion } from './bankHolidays';

export type PayFrequency = (typeof PAY_FREQUENCY)[keyof typeof PAY_FREQUENCY];
export type PaydayType = (typeof PAYDAY_TYPE)[keyof typeof PAYDAY_TYPE];
export type Weekday = (typeof WEEKDAY)[keyof typeof WEEKDAY];

export interface PaydayConfig {
  frequency: PayFrequency;
  type: PaydayType;
  dayOfMonth?: number;
  weekday?: Weekday;
  firstPayDate?: string;
  bankHolidayRegion?: BankHolidayRegion;
}

export interface PaydayInfo {
  payday: Date;
  isPayday: boolean;
}
