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

/* "9 Oct" */
export const formatDayMonth = (date: Date) => `${date.getDate()} ${MONTHS[date.getMonth()]}`;
