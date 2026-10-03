import { BankHolidayRegion, PayFrequency, PaydayType, Weekday } from '~/graphql/generated';

// How someone is paid, as stored on the account's payday
export interface PaydayConfig {
  frequency: PayFrequency;
  type: PaydayType;
  dayOfMonth?: number | null;
  weekday?: Weekday | null;
  firstPayDate?: string | null;
  bankHolidayRegion?: BankHolidayRegion | null;
}

// An entry from https://www.gov.uk/bank-holidays.json
export interface BankHoliday {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
}
