import {
  PAY_FREQUENCY,
  PAYDAY_MONTH_FREQUENCIES,
  PAYDAY_PERIOD_MAP,
  PAYDAY_TYPE,
  WEEKDAY
} from '~/constants';
import { BankHoliday, PaydayConfig, PayFrequency, Weekday } from '~/types';
import { getBankHolidays, isBankHoliday } from './bankHolidays';

/* Get date in 'DD/MM/YYYY format from BSON timestamp */
export const getDateFromTimestamp = (number: number) => new Date(number).toLocaleDateString();

/* Formats a date string into 'Friday, 29 April 2022' format in uppercase*/
export const formatFullDate = (date: string) =>
  new Date(date)
    .toLocaleDateString('default', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    .toUpperCase();

/* Get last day of month */
const getEOM = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

/* Get first day of month */
const getSOM = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

const adjustForNonWorkingDays = (date: Date, bankHolidays: BankHoliday[]): Date => {
  const result = new Date(date);

  while (
    result.getDay() === 0 || // Sunday
    result.getDay() === 6 || // Saturday
    (bankHolidays.length > 0 && isBankHoliday(result, bankHolidays))
  ) {
    result.setDate(result.getDate() - 1);
  }

  return result;
};

/* Returns last Friday of the period */
const getLastFriday = (date: Date): Date => {
  const lastDay = getEOM(date);
  while (lastDay.getDay() !== 5) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  return lastDay;
};

/* Add months to date */
const addMonths = (date: Date, periods: number): Date => {
  const result = new Date(date);
  result.setDate(1); // Set to start of month
  result.setMonth(result.getMonth() + periods);
  return result;
};

/* Add weeks to date */
const addWeeks = (date: Date, weeks: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
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
  const currentDay = result.getDay();
  const daysToAdd = (targetDay + 7 - currentDay) % 7;

  result.setDate(result.getDate() + daysToAdd);
  return result;
};

interface PaydayInfo {
  payday: string;
  isPayday: boolean;
}

/* Get payday for a given date based on configuration */
const getPaydayForDate = (baseDate: Date, config: PaydayConfig): Date => {
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
        result.setDate(config.dayOfMonth);
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
export const getPayday = async (date: Date, config: PaydayConfig): Promise<PaydayInfo> => {
  const today = new Date(date);
  const bankHolidays = config.bankHolidayRegion
    ? await getBankHolidays(config.bankHolidayRegion)
    : [];

  // Handle payday calculations based on firstPayDate if it exists
  if (config.firstPayDate) {
    const firstPayDate = new Date(config.firstPayDate);

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
      while (nextPay <= today) {
        nextPay = getNextPayPeriod(nextPay, config.frequency);
      }

      // Adjust for specific weekday if required
      if (config.type === PAYDAY_TYPE.SET_WEEKDAY && config.weekday) {
        nextPay = getNextWeekday(nextPay, config.weekday);
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
  const eom = getEOM(date);
  let startingDate = date;

  // If we're past the end of month, increment to next month
  if (date.getDate() >= eom.getDate()) {
    startingDate = getSOM(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  }

  return startingDate;
};

/* Returns a months array in string format based on number prop */
export const getNextNumberOfMonths = (date: Date, number: number) => {
  let month = date.getMonth();
  let year = date.getFullYear();

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
