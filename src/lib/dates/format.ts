import { plural } from '../format';
// Dates in the app are local, so they're formatted in the browser's own time zone
const longDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric'
});

const longDateNoYear = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long'
});

/* "Friday 2 October 2026", or "Friday 2 October" without the year */
export const formatLongDate = (date: Date, { withYear = true } = {}) =>
  (withYear ? longDate : longDateNoYear).format(date).replace(',', '');

// en-GB abbreviates September as "Sept"; the design uses three letters throughout
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/* "Fri 9 Oct", or with the year: "Fri 9 Oct 2026" */
export const formatShortDay = (date: Date, { withYear = false } = {}) =>
  `${DAYS[date.getDay()]} ${date.getDate()} ${MONTHS[date.getMonth()]}` +
  (withYear ? ` ${date.getFullYear()}` : '');

/*
 * "Fri 9 Oct", with the year when it isn't this year: "Thu 1 Jul 2027", so a date stays short
 * enough for a half-width field on a phone
 */
export const formatShortDate = (date: Date, today: Date) =>
  formatShortDay(date, { withYear: date.getFullYear() !== today.getFullYear() });

/* "1 month", "2 weeks", "3 days": how long before something */
export const spanText = (days: number) => {
  if (days === 30) return '1 month';
  if (days === 90) return '3 months';
  if (days % 7 === 0) return plural(days / 7, 'week');
  return plural(days, 'day');
};

/* "today", "tomorrow", "in 3 days" */
export const inDays = (days: number) =>
  days <= 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`;

/* "9 Oct" */
export const formatDayMonth = (date: Date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`;

/* "9 Oct 2026" */
export const formatDayMonthYear = (date: Date) => `${formatDayMonth(date)} ${date.getFullYear()}`;

/* "Sep" */
export const formatShortMonth = (date: Date) => MONTHS[date.getMonth()];

/* "Fri" */
export const formatShortWeekday = (date: Date) => DAYS[date.getDay()];

const longWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' });

/* "Friday" */
export const formatLongWeekday = (date: Date) => longWeekday.format(date);

const longMonth = new Intl.DateTimeFormat('en-GB', { month: 'long' });

/* "November" */
export const formatLongMonth = (date: Date) => longMonth.format(date);

/* "November 2026" */
export const formatLongMonthYear = (date: Date) => `${formatLongMonth(date)} ${date.getFullYear()}`;

/* "May 2028" */
export const formatMonthYear = (date: Date) => `${formatShortMonth(date)} ${date.getFullYear()}`;
