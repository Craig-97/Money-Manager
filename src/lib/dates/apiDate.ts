import { toIsoDate } from './isoDate';

// The API stores calendar dates as midnight UTC and returns them through GraphQL String as epoch
// milliseconds ("1782864000000"). The app works with local Dates at midnight, so the day never
// shifts with the browser's time zone.

/* An API date -> a local Date at midnight on the same calendar day, or null */
export const fromApiDate = (value: string | null | undefined) => {
  if (!value) return null;
  const ms = Number(value);
  const date = Number.isNaN(ms) ? new Date(value) : new Date(ms);
  if (Number.isNaN(date.getTime())) return null;
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

/* A local Date -> 'YYYY-MM-DD', which the API reads as that calendar day */
export const toApiDate = (date: Date) => toIsoDate(date);

/* Today as a local Date at midnight */
export const startOfToday = (now = new Date()) =>
  new Date(now.getFullYear(), now.getMonth(), now.getDate());

/* A local Date some number of days later, keeping midnight across clock changes */
export const addDays = (date: Date, days: number) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);

/* Whole days from one local midnight to another */
export const daysBetween = (from: Date, to: Date) =>
  Math.round((startOfToday(to).getTime() - startOfToday(from).getTime()) / 86_400_000);

export const isSameDay = (a: Date, b: Date) => toIsoDate(a) === toIsoDate(b);
