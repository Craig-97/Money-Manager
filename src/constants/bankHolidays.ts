import { BankHolidayRegion } from '~/graphql/generated';

export const BANK_HOLIDAY_REGION = {
  ENGLAND_AND_WALES: 'ENGLAND_AND_WALES',
  SCOTLAND: 'SCOTLAND',
  NORTHERN_IRELAND: 'NORTHERN_IRELAND'
} as const satisfies { [K in BankHolidayRegion]: K };
