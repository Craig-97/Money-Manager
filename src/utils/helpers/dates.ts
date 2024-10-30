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
  const bankHolidays = config.bankHolidayRegion
    ? await getBankHolidays(config.bankHolidayRegion)
    : [];

  let payday = new Date(date);
  let isPayday = false;

  const getNextPeriodDate = (currentDate: Date): Date => {
    const periodMap: Record<PAY_FREQUENCY, number> = {
      [PAY_FREQUENCY.WEEKLY]: 1,
      [PAY_FREQUENCY.FORTNIGHTLY]: 2,
      [PAY_FREQUENCY.FOUR_WEEKLY]: 4,
      [PAY_FREQUENCY.MONTHLY]: 1,
      [PAY_FREQUENCY.QUARTERLY]: 3,
      [PAY_FREQUENCY.BIANNUAL]: 6,
      [PAY_FREQUENCY.ANNUAL]: 12
    };

    const periods = periodMap[config.frequency] ?? 1;
    return config.frequency.includes('WEEKLY')
      ? addWeeks(currentDate, periods)
      : addMonths(currentDate, periods);
  };

  switch (config.type) {
    case PAYDAY_TYPE.LAST_DAY: {
      payday = await getLastWorkingDay(date, bankHolidays);
      if (payday < today) {
        payday = await getLastWorkingDay(getNextPeriodDate(date), bankHolidays);
      }
      break;
    }

    case PAYDAY_TYPE.LAST_FRIDAY: {
      payday = getLastFriday(date);
      if (payday < today) {
        payday = getLastFriday(getNextPeriodDate(date));
      }
      if (bankHolidays.length > 0) {
        payday = getNearestPreviousWorkingDay(payday, bankHolidays);
      }
      break;
    }

    case PAYDAY_TYPE.SET_DAY: {
      if (!config.dayOfMonth) break;

      payday.setDate(config.dayOfMonth);
      payday = getNearestPreviousWorkingDay(payday, bankHolidays);

      if (payday < today) {
        const nextMonth = new Date(date.getFullYear(), date.getMonth(), config.dayOfMonth);
        payday = getNearestPreviousWorkingDay(getNextPeriodDate(nextMonth), bankHolidays);
      }
      break;
    }
  }

  isPayday = today.getTime() === payday.getTime();
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
