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
