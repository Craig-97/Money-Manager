const UK_TIMEZONE = 'Europe/London';

const longDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: UK_TIMEZONE
});

const longDateNoYear = new Intl.DateTimeFormat('en-GB', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: UK_TIMEZONE
});

/* "Friday 2 October 2026", or "Friday 2 October" without the year */
export const formatLongDate = (date: Date, { withYear = true } = {}) =>
  (withYear ? longDate : longDateNoYear).format(date).replace(',', '');
