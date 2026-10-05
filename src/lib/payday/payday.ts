import { PAY_FREQUENCY, PAYDAY_TYPE } from '~/constants';
import { PayFrequency, Weekday } from '~/graphql/generated';
import { addDays, fromApiDate, parseIsoDate, PaydayConfig, toIsoDate } from '~/lib/dates';

// Bank holidays as 'YYYY-MM-DD', for the region the user picked
export type BankHolidays = ReadonlySet<string>;

export interface PayCycle {
  // The most recent payday, on or before today
  start: Date;
  // The next payday after today
  end: Date;
  // The date `end` would be without a move by the user; the same day when it hasn't been moved
  endUsual: Date;
  // Today is payday
  isPayday: boolean;
}

const MONTHS_BETWEEN: Partial<Record<PayFrequency, number>> = {
  [PAY_FREQUENCY.MONTHLY]: 1,
  [PAY_FREQUENCY.QUARTERLY]: 3,
  [PAY_FREQUENCY.BIANNUAL]: 6,
  [PAY_FREQUENCY.ANNUAL]: 12
};

const DAYS_BETWEEN: Partial<Record<PayFrequency, number>> = {
  [PAY_FREQUENCY.WEEKLY]: 7,
  [PAY_FREQUENCY.FORTNIGHTLY]: 14,
  [PAY_FREQUENCY.FOUR_WEEKLY]: 28
};

const WEEKDAY_NUMBER: Record<Weekday, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5
};

const isWorkingDay = (date: Date, holidays: BankHolidays) =>
  date.getDay() !== 0 && date.getDay() !== 6 && !holidays.has(toIsoDate(date));

/* Pay that would land on a weekend or bank holiday arrives the working day before */
const toWorkingDay = (date: Date, holidays: BankHolidays) => {
  let day = date;
  while (!isWorkingDay(day, holidays)) day = addDays(day, -1);
  return day;
};

/* The last given weekday (0 = Sunday) on or before the last day of a month */
const lastWeekdayOf = (lastDay: Date, weekday: number) =>
  addDays(lastDay, -((lastDay.getDay() - weekday + 7) % 7));

/* The payday rule applied to one month, before moving off weekends and bank holidays */
const paydayInMonth = (year: number, month: number, config: PaydayConfig) => {
  const lastDay = new Date(year, month + 1, 0);

  switch (config.type) {
    case PAYDAY_TYPE.LAST_WEEKDAY:
      return lastWeekdayOf(lastDay, WEEKDAY_NUMBER[config.weekday ?? 'FRIDAY']);
    case PAYDAY_TYPE.SET_DAY:
      return new Date(year, month, Math.min(config.dayOfMonth ?? 1, lastDay.getDate()));
    default:
      return lastDay;
  }
};

/* Paydays for month-based pay, for the months between two dates */
const monthlyPaydays = (config: PaydayConfig, holidays: BankHolidays, from: Date, to: Date) => {
  const step = MONTHS_BETWEEN[config.frequency] ?? 1;
  // Quarterly and longer count from the month of the first pay date
  const anchor = (step > 1 && fromApiDate(config.firstPayDate)) || from;
  const anchorIndex = anchor.getFullYear() * 12 + anchor.getMonth();
  const fromIndex = from.getFullYear() * 12 + from.getMonth() - 1;
  const toIndex = to.getFullYear() * 12 + to.getMonth() + 1;

  const paydays: Date[] = [];
  const first = anchorIndex + Math.floor((fromIndex - anchorIndex) / step) * step;
  for (let index = first; index <= toIndex; index += step) {
    paydays.push(toWorkingDay(paydayInMonth(Math.floor(index / 12), index % 12, config), holidays));
  }
  return paydays;
};

/* Paydays for week-based pay, counting from the first pay date */
const weeklyPaydays = (config: PaydayConfig, holidays: BankHolidays, from: Date, to: Date) => {
  const step = DAYS_BETWEEN[config.frequency] ?? 7;
  let anchor = fromApiDate(config.firstPayDate) ?? from;
  if (config.type === PAYDAY_TYPE.SET_WEEKDAY && config.weekday) {
    const target = WEEKDAY_NUMBER[config.weekday];
    anchor = addDays(anchor, (target - anchor.getDay() + 7) % 7);
  }

  const daysFromAnchor = Math.floor((from.getTime() - anchor.getTime()) / 86_400_000);
  const paydays: Date[] = [];
  for (let k = Math.floor(daysFromAnchor / step) - 1; ; k++) {
    const payday = addDays(anchor, k * step);
    if (payday > addDays(to, step)) break;
    paydays.push(toWorkingDay(payday, holidays));
  }
  return paydays;
};

// A payday, and the date the rule gave it when the user has moved it
export interface PaydayDate {
  date: Date;
  // The date the rule gave, for a payday the user moved; null otherwise
  usual: Date | null;
}

/* Moves the paydays the user has overridden. An override belongs to the date the rule gave. */
const withOverrides = (paydays: Date[], config: PaydayConfig): PaydayDate[] => {
  const moves = new Map(config.overrides?.map(item => [item.for, item.date]));
  return paydays.map(usual => {
    const moved = parseIsoDate(moves.get(toIsoDate(usual)));
    return moved ? { date: moved, usual } : { date: usual, usual: null };
  });
};

/* Every payday from a little before `from` to a little after `to`, in order */
export const getPaydayDates = (
  config: PaydayConfig,
  holidays: BankHolidays,
  from: Date,
  to: Date
): PaydayDate[] => {
  const paydays =
    config.frequency in DAYS_BETWEEN
      ? weeklyPaydays(config, holidays, from, to)
      : monthlyPaydays(config, holidays, from, to);
  return withOverrides(paydays, config).sort((a, b) => a.date.getTime() - b.date.getTime());
};

export const getPaydays = (
  config: PaydayConfig,
  holidays: BankHolidays,
  from: Date,
  to: Date
): Date[] => getPaydayDates(config, holidays, from, to).map(payday => payday.date);

/* The pay cycle today falls in: from the last payday to the next */
export const getPayCycle = (
  config: PaydayConfig,
  holidays: BankHolidays,
  today: Date
): PayCycle => {
  const step = (MONTHS_BETWEEN[config.frequency] ?? 1) * 31;
  const paydays = getPaydayDates(config, holidays, addDays(today, -step), addDays(today, step));
  const next = paydays.find(payday => payday.date > today);
  const end = next?.date ?? addDays(today, step);
  const start = paydays.findLast(payday => payday.date <= today)?.date ?? today;

  return {
    start,
    end,
    endUsual: next?.usual ?? end,
    isPayday: toIsoDate(start) === toIsoDate(today)
  };
};

/* The next few paydays from a date, with any the user has moved marked */
export const getNextPaydayDates = (
  config: PaydayConfig,
  holidays: BankHolidays,
  from: Date,
  count: number
) => {
  const step = (MONTHS_BETWEEN[config.frequency] ?? 1) * 31;
  return getPaydayDates(config, holidays, from, addDays(from, step * (count + 1)))
    .filter(payday => payday.date >= from)
    .slice(0, count);
};

/* The next few paydays from a date, e.g. for setup's "Next payday ... then ..." */
export const getNextPaydays = (
  config: PaydayConfig,
  holidays: BankHolidays,
  from: Date,
  count: number
) => getNextPaydayDates(config, holidays, from, count).map(payday => payday.date);
