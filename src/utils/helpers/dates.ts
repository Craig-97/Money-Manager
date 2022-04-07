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

/* Returns last of specified day in month of date
/ ECMAScript day numbering: 0 = Sun, 1 = Mon, etc. */
const getLastOfDay = (date: Date, day: number) => {
  let lastDay = getEOM(date);
  // Set to last of specified day
  lastDay.setDate(lastDay.getDate() - ((lastDay.getDay() + (7 - day)) % 7));
  return lastDay;
};

/* Add months to date */
const addMonths = (date: Date, months: number) => {
  let d = new Date(date);
  d.setMonth(d.getMonth() + Number(months));
  // If new day not equal to old day then have overshot end of
  // month, so set d to end of previous month
  if (d.getDate() !== date.getDate()) {
    d.setDate(0);
  }
  return d;
};

/*
 * Returns next friday which is payday and if passed date is payday.
 */
export const getPayday = (date: Date) => {
  let eom = getEOM(date);
  const lastFriday = getLastOfDay(eom, 5);
  let isPayday = false;

  // If date is within 7 days of eom, increment month
  if (date.getDate() > lastFriday.getDate()) {
    eom = addMonths(eom, 1);
  }

  if (date.getDate() === lastFriday.getDate()) {
    isPayday = true;
  }
  // Get next Friday which is payday
  const next = getLastOfDay(eom, 5);

  return { next, isPayday };
};

/*
 * Returns a months array in string format based on number prop.
 * When January is in the array, the year will also be returned
 */
export const getNextNumberOfMonthNames = (number: number) => {
  const now = new Date();
  let month = now.getMonth();
  let year = now.getFullYear();

  var names = [
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

  var res = [];
  for (var i = 0; i < number; ++i) {
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
