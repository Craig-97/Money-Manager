export enum PaydayType {
  SPECIFIC_DATE = 'SPECIFIC_DATE',
  LAST_WORKING_DAY = 'LAST_WORKING_DAY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  SPECIFIC_WEEKDAY = 'SPECIFIC_WEEKDAY',
  LAST_WEEKDAY = 'LAST_WEEKDAY'
}

export enum Weekday {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6
}

export interface PaydayConfig {
  type: PaydayType;
  // For SPECIFIC_DATE
  dayOfMonth?: number;
  // For WEEKLY/BIWEEKLY
  weekday?: Weekday;
  startDate?: string; // ISO date string
  // For SPECIFIC_WEEKDAY
  weekdayOccurrence?: number; // 1st, 2nd, 3rd, 4th
}

export interface PaydayInfo {
  payday: Date;
  isPayday: boolean;
}
