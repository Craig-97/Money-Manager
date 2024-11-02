import {
  PAY_FREQUENCY,
  PAYDAY_MONTH_FREQUENCIES,
  PAYDAY_PERIOD_MAP,
  PAYDAY_TYPE,
  WEEKDAY
} from '~/constants';
import { BankHoliday, Payday, PayFrequency, Weekday } from '~/types';
import { getBankHolidays, isBankHoliday } from './bankHolidays';

const UK_TIMEZONE = 'Europe/London';

/* Normalize any date to start of UK day */
const normalizeToUKDate = (date: Date): Date => {
  // First ensure we have a valid date
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid date provided to normalizeToUKDate');
  }

  // Create new date using UK locale string
  const ukDateString = date.toLocaleString('en-GB', { timeZone: UK_TIMEZONE });
  const [datePart] = ukDateString.split(', ');
  const [day, month, year] = datePart.split('/').map(Number);

  // Create new UTC date set to midnight
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

/* Get date in 'DD/MM/YYYY format from BSON timestamp */
export const getDateFromTimestamp = (number: number) =>
  normalizeToUKDate(new Date(number)).toISOString().split('T')[0];

/* Formats a date string into 'Friday, 29 April 2022' format in uppercase*/
export const formatFullDate = (date: string) => {
  const d = new Date(date);
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: UK_TIMEZONE
  })
    .format(d)
    .toUpperCase();
};

/* Get last day of month (in UK time) */
const getEOM = (date: Date) => {
  const ukDate = normalizeToUKDate(date);
  return new Date(Date.UTC(ukDate.getUTCFullYear(), ukDate.getUTCMonth() + 1, 0));
};

/* Get first day of month (in UK time) */
const getSOM = (date: Date) => {
  const ukDate = normalizeToUKDate(date);
  return new Date(Date.UTC(ukDate.getUTCFullYear(), ukDate.getUTCMonth(), 1));
};

const adjustForNonWorkingDays = (date: Date, bankHolidays: BankHoliday[]): Date => {
  let result = normalizeToUKDate(date);

  // Keep moving backwards while we're on a non-working day
  while (
    result.getUTCDay() === 0 || // Sunday
    result.getUTCDay() === 6 || // Saturday
    (bankHolidays.length > 0 && isBankHoliday(result, bankHolidays))
  ) {
    result.setUTCDate(result.getUTCDate() - 1);
  }

  return result;
};

/* Returns last Friday of the period */
const getLastFriday = (date: Date): Date => {
  const lastDay = getEOM(date);
  while (lastDay.getUTCDay() !== 5) {
    lastDay.setUTCDate(lastDay.getUTCDate() - 1);
  }
  return lastDay;
};

/* Add months to date - used UTC to avoid any timezone-induced shifts*/
const addMonths = (date: Date, periods: number): Date => {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();

  // Calculate target year and month
  const targetMonth = month + periods;
  const targetYear = year + Math.floor(targetMonth / 12);
  const adjustedMonth = targetMonth % 12;

  // Find the last day of the target month
  const lastDayInTargetMonth = new Date(Date.UTC(targetYear, adjustedMonth + 1, 0)).getUTCDate();

  // Determine final day, preferring the original day unless it exceeds the last day of the target month
  const finalDay = Math.min(day, lastDayInTargetMonth);

  return new Date(Date.UTC(targetYear, adjustedMonth, finalDay));
};

/* Add weeks to date */
const addWeeks = (date: Date, weeks: number): Date => {
  const result = new Date(date);
  // Use UTC methods to avoid DST issues
  result.setUTCDate(result.getUTCDate() + weeks * 7);

  return result;
};

/* Convert WEEKDAY enum to JavaScript day number (0-6) */
const getWeekdayNumber = (weekday: Weekday): number => {
  const weekdayMap: Record<Weekday, number> = {
    [WEEKDAY.MONDAY]: 1,
    [WEEKDAY.TUESDAY]: 2,
    [WEEKDAY.WEDNESDAY]: 3,
    [WEEKDAY.THURSDAY]: 4,
    [WEEKDAY.FRIDAY]: 5,
    [WEEKDAY.SATURDAY]: 6,
    [WEEKDAY.SUNDAY]: 0
  };
  return weekdayMap[weekday];
};

/* Get next occurrence of specified weekday */
const getNextWeekday = (date: Date, weekday: Weekday): Date => {
  const result = new Date(date);
  const targetDay = getWeekdayNumber(weekday);
  const currentDay = result.getUTCDay();
  const daysToAdd = (targetDay + 7 - currentDay) % 7;

  result.setUTCDate(result.getUTCDate() + daysToAdd);
  return result;
};

interface PaydayInfo {
  payday: string;
  isPayday: boolean;
}

/* Get payday for a given date based on configuration */
const getPaydayForDate = (baseDate: Date, config: Payday): Date => {
  let result = new Date(baseDate);

  switch (config.type) {
    case PAYDAY_TYPE.LAST_DAY:
      result = getEOM(result);
      break;
    case PAYDAY_TYPE.LAST_FRIDAY:
      result = getLastFriday(result);
      break;
    case PAYDAY_TYPE.SET_DAY:
      if (config.dayOfMonth) {
        result = new Date(
          Date.UTC(result.getUTCFullYear(), result.getUTCMonth(), config.dayOfMonth)
        );
      }
      break;
    case PAYDAY_TYPE.SET_WEEKDAY:
      if (config.weekday) {
        result = getNextWeekday(result, config.weekday);
      }
      break;
  }

  return result;
};

/* Get next pay period based on frequency */
const getNextPayPeriod = (date: Date, frequency: PayFrequency): Date => {
  const periods = PAYDAY_PERIOD_MAP[frequency] ?? 1;

  // Handle month-based frequencies
  if (PAYDAY_MONTH_FREQUENCIES.includes(frequency)) {
    return addMonths(date, periods);
  }

  // Handle weekly-based frequencies
  return addWeeks(date, periods);
};

/* Returns next payday based on configuration */
export const getPayday = async (date: Date, config: Payday): Promise<PaydayInfo> => {
  // Normalize the input date to start of day in UK time
  const today = normalizeToUKDate(date);

  const bankHolidays = config.bankHolidayRegion
    ? await getBankHolidays(config.bankHolidayRegion)
    : [];

  // Handle payday calculations based on firstPayDate if it exists
  if (config.firstPayDate) {
    const firstPayDate = normalizeToUKDate(new Date(config.firstPayDate));

    // Case 1: First pay date is in the future - use it directly
    if (firstPayDate >= today) {
      const payday = adjustForNonWorkingDays(firstPayDate, bankHolidays);
      return {
        payday: payday.toISOString().split('T')[0],
        isPayday: today.getTime() === payday.getTime()
      };
    }

    // Case 2: First pay date is in the past and frequency is non-monthly
    // Calculate next payday based on the recurring pattern from firstPayDate
    if (config.frequency !== PAY_FREQUENCY.MONTHLY) {
      // Find the next occurrence after today by adding periods

      let nextPay = getNextPayPeriod(firstPayDate, config.frequency);

      if (config.type === PAYDAY_TYPE.SET_WEEKDAY && config.weekday) {
        nextPay = getNextWeekday(nextPay, config.weekday);
      }

      while (nextPay <= today) {
        nextPay = getNextPayPeriod(nextPay, config.frequency);
      }

      const payday = adjustForNonWorkingDays(nextPay, bankHolidays);

      return {
        payday: payday.toISOString().split('T')[0],
        isPayday: today.getTime() === payday.getTime()
      };
    }
  }

  // Find the next payday from current date and adjust for non-working days
  let payday = adjustForNonWorkingDays(getPaydayForDate(today, config), bankHolidays);

  // If the calculated payday is in the past or today, move to next period
  if (payday <= today) {
    const nextPeriod = getNextPayPeriod(today, config.frequency);
    const nextPayday = getPaydayForDate(nextPeriod, config);
    payday = adjustForNonWorkingDays(nextPayday, bankHolidays);
  }

  return {
    payday: payday.toISOString().split('T')[0],
    isPayday: today.getTime() === payday.getTime()
  };
};

/* Returns start of next month if payday is current day or in the past */
export const getForecastDate = (date: Date) => {
  const ukDate = normalizeToUKDate(date);
  const eom = getEOM(ukDate);
  let startingDate = ukDate;

  // If we're past the end of month, increment to next month
  if (ukDate.getUTCDate() >= eom.getUTCDate()) {
    startingDate = getSOM(new Date(ukDate.getUTCFullYear(), ukDate.getUTCMonth() + 1, 1));
  }

  return startingDate;
};

/* Returns a months array in string format based on number prop */
export const getNextNumberOfMonths = (date: Date, number: number) => {
  const ukDate = normalizeToUKDate(date);
  let month = ukDate.getUTCMonth();
  let year = ukDate.getUTCFullYear();

  const names = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const res = [];
  for (let i = 0; i < number; ++i) {
    if (names[month] === 'January') {
      res.push(names[month] + ' ' + year);
    } else {
      res.push(names[month]);
    }
    if (++month === 12) {
      month = 0;
      ++year;
    }
  }
  return res;
};
