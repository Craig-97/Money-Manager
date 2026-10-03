// Calendar dates in forms are 'YYYY-MM-DD' strings, read and written in local time so a picked day
// never shifts across midnight.

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/* '2026-10-02' -> a local Date at midnight, or undefined if it isn't a valid date */
export const parseIsoDate = (value: string | null | undefined) => {
  const match = ISO_DATE.exec(value ?? '');
  if (!match) return undefined;

  const [year, month, day] = [Number(match[1]), Number(match[2]) - 1, Number(match[3])];
  const date = new Date(year, month, day);
  return date.getMonth() === month && date.getDate() === day ? date : undefined;
};

/* A local Date -> '2026-10-02' */
export const toIsoDate = (date: Date) =>
  [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0')
  ].join('-');

const shortDate = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  year: 'numeric'
});

/* "Fri 2 Oct 2026", as the design's date fields show it */
export const formatPickerDate = (date: Date) => shortDate.format(date).replace(',', '');
