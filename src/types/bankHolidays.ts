import { BANK_HOLIDAY_REGION } from '~/constants';

export type BankHolidayRegion = (typeof BANK_HOLIDAY_REGION)[keyof typeof BANK_HOLIDAY_REGION];

export interface BankHoliday {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
}
