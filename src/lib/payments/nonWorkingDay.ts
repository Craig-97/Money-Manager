import { NonWorkingDay } from '~/graphql/generated';
import { addDays, toIsoDate } from '~/lib/dates';
import { BankHolidays, isWorkingDay } from '~/lib/payday';

/*
 * Moving a recurring payment's dates off weekends and bank holidays. The API keeps the dates the
 * schedule gives (nextDueDate and records); the app shows each one on the day it goes out. Mirrors
 * the API's utils/payday/nonWorkingDays.ts.
 */

export interface DateMove {
  rule: NonWorkingDay;
  holidays: BankHolidays;
}

// Further than any date moves: Christmas, Boxing Day and a weekend, with room to spare
export const MAX_MOVE_DAYS = 7;

export const NON_WORKING_DAY_LABELS: Record<NonWorkingDay, string> = {
  NEXT: 'Next working day',
  BEFORE: 'Working day before',
  ON_DAY: 'On the day'
};

export const NON_WORKING_DAYS = Object.keys(NON_WORKING_DAY_LABELS) as NonWorkingDay[];

// What the budget uses before it's chosen anything: most direct debits go out the next working day
export const DEFAULT_NON_WORKING_DAY: NonWorkingDay = 'NEXT';

/* The day a date goes out on: itself on a working day, otherwise as the rule says */
export const goesOutOn = (date: Date, move: DateMove | null | undefined) => {
  if (!move || move.rule === 'ON_DAY') return date;
  const step = move.rule === 'BEFORE' ? -1 : 1;
  let day = date;
  while (!isWorkingDay(day, move.holidays)) day = addDays(day, step);
  return day;
};

/* "a Saturday", "a Sunday" or "a bank holiday": why a date isn't a working day */
export const nonWorkingReason = (date: Date, holidays: BankHolidays) =>
  holidays.has(toIsoDate(date))
    ? 'a bank holiday'
    : date.getDay() === 0
      ? 'a Sunday'
      : 'a Saturday';

/* "the next working day", as the end of "so it goes out …" */
export const movedHow = (rule: NonWorkingDay) =>
  rule === 'BEFORE' ? 'the working day before' : 'the next working day';
