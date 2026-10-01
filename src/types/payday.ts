import { BankHolidayRegion } from './bankHolidays';
import { PayFrequency, PaydayType, Weekday } from '~/graphql/generated';

// The API's enums are the source of truth for these
export type { PayFrequency, PaydayType, Weekday };

export interface Payday {
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
