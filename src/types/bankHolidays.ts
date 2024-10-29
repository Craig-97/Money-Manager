export enum BANK_HOLIDAY_REGION {
  ENGLAND_AND_WALES = 'england-and-wales',
  SCOTLAND = 'scotland',
  NORTHERN_IRELAND = 'northern-ireland'
}

export interface BankHoliday {
  title: string;
  date: string;
  notes: string;
  bunting: boolean;
}
