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

/* Returns the closest weekday from a passed in date, prioritises 
future dates if in same month otherwise will set to previous friday */
const getClosestWeekday = (date: Date, eom: Date) => {
  let closestWeekday = new Date(date);

  // If current date is the end of the month then set to last Friday
  if (date.getDate() === eom.getDate()) {
    closestWeekday.setDate(closestWeekday.getDate() - ((closestWeekday.getDay() + 2) % 7));
  }

  // If current date is before the end of the month
  if (closestWeekday.getDate() < eom.getDate()) {
    // Find next monday from current date
    const nextMonday = new Date(closestWeekday);
    nextMonday.setDate(closestWeekday.getDate() + ((1 + 7 - closestWeekday.getDay()) % 7));

    // If next monday is still within the same month and year, set closest weekday to next monday otherwise set to last friday */
    if (
      closestWeekday.getMonth() === nextMonday.getMonth() &&
      closestWeekday.getFullYear() === nextMonday.getFullYear()
    ) {
      closestWeekday = new Date(nextMonday);
    } else {
      closestWeekday.setDate(closestWeekday.getDate() - ((closestWeekday.getDay() + 2) % 7));
    }
  }

  return closestWeekday;
};

/*
 * Returns payday on the 28th of the month or closest available weekday
 */
export const getPayday = (date: Date) => {
  let eom = getEOM(date);
  let isPayday = false;

  // Sets payday to 28th of this month
  const dateNumber = new Date(date).setDate(28);
  let payday = new Date(dateNumber);

  // Checks if 28th of this month is on the weekend
  const isPaydayWeekend = isWeekend(payday);

  // If current payday is a weekend find next closest weekday
  if (isPaydayWeekend) {
    payday = getClosestWeekday(payday, eom);
  }

  // If payday is today then set isPayday to true
  if (payday.getDate() === date.getDate()) {
    isPayday = true;
  }

  // If payday was in the past then find next months payday
  if (payday.getDate() < date.getDate()) {
    // Reset eom to next month
    eom = addMonths(eom, 1);

    // Reset payday to 28th of next month
    payday = new Date(dateNumber);
    payday.setMonth(date.getMonth() + 1);

    // If next payday is on a weekend find the closest weekday
    const isNextPayDayWeekend = isWeekend(payday);
    if (isNextPayDayWeekend) {
      payday = getClosestWeekday(payday, eom);
    }
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
