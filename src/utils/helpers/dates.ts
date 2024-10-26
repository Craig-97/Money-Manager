import { PaydayConfig, PaydayInfo, PaydayType, Weekday } from '~/types/payday';

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

/* Returns last working day of the month */
const getLastWorkingDay = (date: Date): Date => {
  const lastDay = getEOM(date);
  while (isWeekend(lastDay)) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  return lastDay;
};

/* Returns the next occurrence of a specific weekday */
const getNextWeekday = (date: Date, targetDay: Weekday): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + ((7 + targetDay - date.getDay()) % 7));
  return result;
};

/* Returns specific occurrence of weekday in month (1st, 2nd, 3rd, 4th) */
const getNthWeekday = (date: Date, weekday: Weekday, n: number): Date => {
  const firstDay = getSOM(date);
  const firstOccurrence = getNextWeekday(firstDay, weekday);
  firstOccurrence.setDate(firstOccurrence.getDate() + (n - 1) * 7);
  return firstOccurrence;
};

/* Returns last occurrence of specified weekday in month */
const getLastWeekday = (date: Date, weekday: Weekday): Date => {
  const lastDay = getEOM(date);
  while (lastDay.getDay() !== weekday) {
    lastDay.setDate(lastDay.getDate() - 1);
  }
  return lastDay;
};

/* Returns next payday based on configuration */
export const getPayday = (date: Date, config: PaydayConfig): PaydayInfo => {
  const today = new Date(date);
  let payday = new Date(date);
  let isPayday = false;

  switch (config.type) {
    case PaydayType.SPECIFIC_DATE: {
      payday.setDate(config.dayOfMonth || 1);
      if (payday < today) {
        payday.setMonth(payday.getMonth() + 1);
      }
      isPayday = today.getDate() === config.dayOfMonth;
      break;
    }

    case PaydayType.LAST_WORKING_DAY: {
      payday = getLastWorkingDay(date);
      if (payday < today) {
        payday = getLastWorkingDay(new Date(date.getFullYear(), date.getMonth() + 1, 1));
      }
      isPayday = today.getTime() === payday.getTime();
      break;
    }

    case PaydayType.WEEKLY:
    case PaydayType.BIWEEKLY: {
      if (!config.startDate || !config.weekday) break;

      const start = new Date(config.startDate);
      const weekday = config.weekday;
      payday = getNextWeekday(today, weekday);

      if (config.type === PaydayType.BIWEEKLY) {
        const weeks = Math.floor((today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000));
        if (weeks % 2 === 1) {
          payday.setDate(payday.getDate() + 7);
        }
      }

      isPayday =
        today.getDay() === weekday &&
        (config.type === PaydayType.WEEKLY ||
          Math.floor((today.getTime() - start.getTime()) / (7 * 24 * 60 * 60 * 1000)) % 2 === 0);
      break;
    }

    case PaydayType.SPECIFIC_WEEKDAY: {
      if (!config.weekday || !config.weekdayOccurrence) break;

      payday = getNthWeekday(date, config.weekday, config.weekdayOccurrence);
      if (payday < today) {
        payday = getNthWeekday(
          new Date(date.getFullYear(), date.getMonth() + 1, 1),
          config.weekday,
          config.weekdayOccurrence
        );
      }
      isPayday = today.getTime() === payday.getTime();
      break;
    }

    case PaydayType.LAST_WEEKDAY: {
      if (!config.weekday) break;

      payday = getLastWeekday(date, config.weekday);
      if (payday < today) {
        payday = getLastWeekday(
          new Date(date.getFullYear(), date.getMonth() + 1, 1),
          config.weekday
        );
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
