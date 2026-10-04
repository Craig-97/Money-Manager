import { BankHolidayRegion } from '~/graphql/generated';
import { BankHoliday } from './types';

const BANK_HOLIDAYS_API = 'https://www.gov.uk/bank-holidays.json';
const STORAGE_KEY = 'mm-bank-holidays';
// gov.uk publishes them a year or two ahead, so a week-old copy is fine
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

type AllRegions = Partial<Record<BankHolidayRegion, { events: BankHoliday[] }>>;

interface Stored {
  savedAt: number;
  data: AllRegions;
}

const readStored = (): AllRegions | null => {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Stored | null;
    return stored && Date.now() - stored.savedAt < MAX_AGE_MS ? stored.data : null;
  } catch {
    return null;
  }
};

const fetchAll = async (): Promise<AllRegions> => {
  const stored = readStored();
  if (stored) return stored;

  const response = await fetch(BANK_HOLIDAYS_API);
  if (!response.ok) throw new Error(`Bank holidays request failed: ${response.status}`);
  const data = (await response.json()) as AllRegions;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedAt: Date.now(), data }));
  } catch {
    // Storage full or blocked: the holidays still work for this visit
  }
  return data;
};

// One request for every region, shared by everything that asks
let request: Promise<AllRegions> | null = null;

/*
 * The region's bank holidays as 'YYYY-MM-DD' dates. Fetched from gov.uk once and kept for a week;
 * if they can't be loaded, paydays are worked out from weekends alone.
 */
export const loadBankHolidays = async (region: BankHolidayRegion): Promise<Set<string>> => {
  request ??= fetchAll().catch(error => {
    request = null;
    throw error;
  });
  try {
    const data = await request;
    return new Set((data[region]?.events ?? []).map(event => event.date));
  } catch {
    return new Set();
  }
};
