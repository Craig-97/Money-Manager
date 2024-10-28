import { PaydayConfig, PaydayType, PayFrequency } from '~/types/payday';

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

/* Returns boolean based on if passed date is on the weekend */
const isWeekend = (date: Date) => date.getDay() === 0 || date.getDay() === 6;

/* Get last day of month */
const getEOM = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);

/* Get first day of month */
const getSOM = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

/* Returns last working day of the period */
const getLastWorkingDay = (date: Date): Date => {
  const lastDay = getEOM(date);
  while (isWeekend(lastDay)) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  return lastDay;
};

/* Returns last Friday of the period */
const getLastFriday = (date: Date): Date => {
  const lastDay = getEOM(date);
  while (lastDay.getDay() !== 5) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  return lastDay;
};

/* Returns nearest previous working day */
const getNearestPreviousWorkday = (date: Date): Date => {
  const result = new Date(date);
  while (isWeekend(result)) {
    result.setDate(result.getDate() - 1);
  }
  return result;
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

/* Returns next payday based on configuration */
export const getPayday = (date: Date, config: PaydayConfig): PaydayInfo => {
  const today = new Date(date);
  let payday = new Date(date);
  let isPayday = false;

  // Helper to get next period date based on frequency
  const getNextPeriodDate = (currentDate: Date): Date => {
    switch (config.frequency) {
      case PayFrequency.WEEKLY:
        return addWeeks(currentDate, 1);
      case PayFrequency.FORTNIGHTLY:
        return addWeeks(currentDate, 2);
      case PayFrequency.FOUR_WEEKLY:
        return addWeeks(currentDate, 4);
      case PayFrequency.MONTHLY:
        return addMonths(currentDate, 1);
      case PayFrequency.QUARTERLY:
        return addMonths(currentDate, 3);
      case PayFrequency.BIANNUAL:
        return addMonths(currentDate, 6);
      case PayFrequency.ANNUAL:
        return addMonths(currentDate, 12);
      default:
        return addMonths(currentDate, 1);
    }
  };

  // Get payday based on type
  switch (config.type) {
    case PaydayType.LAST_DAY: {
      payday = getLastWorkingDay(date);
      if (payday < today) {
        payday = getLastWorkingDay(getNextPeriodDate(date));
      }
      isPayday = today.getTime() === payday.getTime();
      break;
    }

    case PaydayType.LAST_FRIDAY: {
      payday = getLastFriday(date);
      if (payday < today) {
        payday = getLastFriday(getNextPeriodDate(date));
      }
      isPayday = today.getTime() === payday.getTime();
      break;
    }

    case PaydayType.SET_DAY: {
      if (!config.dayOfMonth) break;

      payday.setDate(config.dayOfMonth);
      payday = getNearestPreviousWorkday(payday);

      if (payday < today) {
        payday = getNextPeriodDate(
          new Date(date.getFullYear(), date.getMonth(), config.dayOfMonth)
        );
        payday = getNearestPreviousWorkday(payday);
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
