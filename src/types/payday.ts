export enum PayFrequency {
  WEEKLY = 'WEEKLY',
  FORTNIGHTLY = 'FORTNIGHTLY',
  FOUR_WEEKLY = 'FOUR_WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  BIANNUAL = 'BIANNUAL',
  ANNUAL = 'ANNUAL'
}

export enum PaydayType {
  LAST_DAY = 'LAST_DAY',
  LAST_FRIDAY = 'LAST_FRIDAY',
  SET_DAY = 'SET_DAY'
}

export interface PaydayConfig {
  frequency: PayFrequency;
  type: PaydayType;
  dayOfMonth?: number;
  startDate?: string;
}

export interface PaydayInfo {
  payday: Date;
  isPayday: boolean;
}
