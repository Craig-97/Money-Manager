import { addDays, startOfToday, toIsoDate } from '~/lib/dates';

/* '2026-10-02' -> a local Date at midnight on that day */
export const day = (iso: string) => {
  const [year, month, date] = iso.split('-').map(Number);
  return new Date(year, month - 1, date);
};

// The boards' today: Friday 2 October 2026
export const TODAY = day('2026-10-02');

/* '2026-10-02' -> how the API sends that date: midnight UTC, in epoch milliseconds */
export const apiDate = (iso: string) => String(Date.parse(`${iso}T00:00:00Z`));

/* The API's date some number of days from today */
export const apiDateFromToday = (days: number) => apiDate(toIsoDate(addDays(startOfToday(), days)));
