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
const isWeekend = (date: Date) => !(date.getDay() % 6);

/* Get last day of month */
const getEOM = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0);
/* Get first day of month */
const getSOM = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1);

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
 * Returns payday on the 28th of the month or previous friday
 */
export const getPayday = (date: Date) => {
  let isPayday = false;

  // Sets payday to 28th of this month
  const dateNumber = new Date(date).setDate(28);
  let payday = new Date(dateNumber);

  // If current payday is a weekend set payday to previous friday
  if (isWeekend(payday)) payday.setDate(payday.getDate() - ((payday.getDay() + 2) % 7));

  // If payday is today then set isPayday to true
  if (payday.getDate() === date.getDate()) isPayday = true;

  // If current months payday was in the past then find next months payday
  if (payday.getDate() < date.getDate()) {
    // Reset payday to 28th of next month
    payday = new Date(dateNumber);
    payday.setMonth(date.getMonth() + 1);

    // If next months payday is a weekend set payday to previous friday
    if (isWeekend(payday)) payday.setDate(payday.getDate() - ((payday.getDay() + 2) % 7));
  }

  return { payday, isPayday };
};

/*
 * Returns start of next month if payday is current day or in the past
 */
export const getForecastDate = (date: Date) => {
  let eom = getEOM(date);
  const lastFriday = getLastOfDay(eom, 5);
  let startingDate = date;

  // If last friday of the month has already been, increment month
  if (date.getDate() >= lastFriday.getDate()) {
    eom = addMonths(eom, 1);
    // Get first date of month
    startingDate = getSOM(eom);
  }

  return startingDate;
};

/*
 * Returns a months array in string format based on number prop.
 * When January is in the array, the year will also be returned
 */
export const getNextNumberOfMonths = (date: Date, number: number) => {
  let month = date.getMonth();
  let year = date.getFullYear();

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
