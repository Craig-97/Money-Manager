import { afterEach, describe, expect, it, vi } from 'vitest';

// The shape gov.uk returns: regions keyed by their kebab-case names
const GOV_UK = {
  'england-and-wales': { events: [{ title: 'Christmas Day', date: '2026-12-25' }] },
  scotland: { events: [{ title: 'St Andrew’s Day', date: '2026-11-30' }] },
  'northern-ireland': { events: [] }
};

// The loaded holidays are shared for the page's lifetime, so each test gets a fresh module
const load = async (region: 'ENGLAND_AND_WALES' | 'SCOTLAND' | 'NORTHERN_IRELAND') => {
  vi.resetModules();
  vi.stubGlobal('fetch', () => Promise.resolve(Response.json(GOV_UK)));
  const { loadBankHolidays } = await import('./bankHolidays');
  return loadBankHolidays(region);
};

describe('loadBankHolidays', () => {
  afterEach(() => vi.unstubAllGlobals());

  it("finds each region's holidays under gov.uk's names for them", async () => {
    expect(await load('ENGLAND_AND_WALES')).toEqual(new Set(['2026-12-25']));
    expect(await load('SCOTLAND')).toEqual(new Set(['2026-11-30']));
    expect(await load('NORTHERN_IRELAND')).toEqual(new Set());
  });

  it('has none when gov.uk cannot be reached', async () => {
    vi.resetModules();
    vi.stubGlobal('fetch', () => Promise.reject(new Error('offline')));
    const { loadBankHolidays } = await import('./bankHolidays');
    expect(await loadBankHolidays('ENGLAND_AND_WALES')).toEqual(new Set());
  });
});
