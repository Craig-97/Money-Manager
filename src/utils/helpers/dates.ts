import { BankHoliday, PaydayConfig, PAYDAY_TYPE, PAY_FREQUENCY } from '~/types';
import { getBankHolidays, isBankHoliday } from './bankHolidays';

/* Get date in 'DD/MM/YYYY format from BSON timestamp */
export const getDateFromTimestamp = (number: number) => new Date(number).toLocaleDateString();

/* Formats a date object into 'Friday, 29 April 2022' format in uppercase*/
export const formatFullDate = (date: Date) =>
  date
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

/* Gets the nearest workday if the current date is a bank holiday or a saturday/sunday */
const getNearestPreviousWorkingDay = (date: Date, bankHolidays: BankHoliday[]): Date => {
  const result = new Date(date);

  while (
    result.getDay() === 0 || // Sunday
    result.getDay() === 6 || // Saturday
    isBankHoliday(result, bankHolidays)
  ) {
    result.setDate(result.getDate() - 1);
  }

  return result;
};

/* Returns last working day of the period */
const getLastWorkingDay = async (date: Date, bankHolidays: BankHoliday[]): Promise<Date> => {
  const lastDay = getEOM(date);
  return getNearestPreviousWorkingDay(lastDay, bankHolidays);
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
const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

/* Add weeks to date */
const addWeeks = (date: Date, weeks: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + weeks * 7);
  return result;
};

interface PaydayInfo {
  payday: Date;
  isPayday: boolean;
}

/* Returns next payday based on configuration */
export const getPayday = async (date: Date, config: PaydayConfig): Promise<PaydayInfo> => {
  const today = new Date(date);
  let payday = new Date(date);
  let isPayday = false;

  // Fetch bank holidays if region is specified
  const bankHolidays = config.bankHolidayRegion
    ? await getBankHolidays(config.bankHolidayRegion)
    : [];

  // Helper to get next period date based on frequency
  const getNextPeriodDate = (currentDate: Date): Date => {
    switch (config.frequency) {
      case PAY_FREQUENCY.WEEKLY:
        return addWeeks(currentDate, 1);
      case PAY_FREQUENCY.FORTNIGHTLY:
        return addWeeks(currentDate, 2);
      case PAY_FREQUENCY.FOUR_WEEKLY:
        return addWeeks(currentDate, 4);
      case PAY_FREQUENCY.MONTHLY:
        return addMonths(currentDate, 1);
      case PAY_FREQUENCY.QUARTERLY:
        return addMonths(currentDate, 3);
      case PAY_FREQUENCY.BIANNUAL:
        return addMonths(currentDate, 6);
      case PAY_FREQUENCY.ANNUAL:
        return addMonths(currentDate, 12);
      default:
        return addMonths(currentDate, 1);
    }
  };

  // Get payday based on type
  switch (config.type) {
    case PAYDAY_TYPE.LAST_DAY: {
      payday = await getLastWorkingDay(date, bankHolidays);
      if (payday < today) {
        payday = await getLastWorkingDay(getNextPeriodDate(date), bankHolidays);
      }
      isPayday = today.getTime() === payday.getTime();
      break;
    }

    case PAYDAY_TYPE.LAST_FRIDAY: {
      payday = getLastFriday(date);
      if (payday < today) {
        payday = getLastFriday(getNextPeriodDate(date));
      }
      // Adjust for bank holidays
      if (bankHolidays.length > 0) {
        payday = getNearestPreviousWorkingDay(payday, bankHolidays);
      }
      isPayday = today.getTime() === payday.getTime();
      break;
    }

    case PAYDAY_TYPE.SET_DAY: {
      if (!config.dayOfMonth) break;

      payday.setDate(config.dayOfMonth);
      payday = getNearestPreviousWorkingDay(payday, bankHolidays);

      if (payday < today) {
        payday = getNextPeriodDate(
          new Date(date.getFullYear(), date.getMonth(), config.dayOfMonth)
        );
        payday = getNearestPreviousWorkingDay(payday, bankHolidays);
      }

      isPayday = today.getTime() === payday.getTime();
      break;
    }
  }

  return { payday, isPayday };
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
