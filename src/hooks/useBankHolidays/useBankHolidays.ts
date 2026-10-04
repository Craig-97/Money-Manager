import { useEffect, useState } from 'react';
import { BankHolidayRegion } from '~/graphql/generated';
import { loadBankHolidays } from '~/lib/dates';
import { BankHolidays } from '~/lib/payday';

const NONE: BankHolidays = new Set();

/*
 * The region's bank holidays, for moving paydays off them. Paydays are worked out from weekends
 * alone until they load, which only changes anything in a week with a bank holiday.
 */
export const useBankHolidays = (region: BankHolidayRegion | null | undefined) => {
  const [loaded, setLoaded] = useState<{ region: string; holidays: BankHolidays } | null>(null);

  useEffect(() => {
    if (!region) return;
    let current = true;
    void loadBankHolidays(region).then(holidays => {
      if (current) setLoaded({ region, holidays });
    });
    return () => {
      current = false;
    };
  }, [region]);

  return loaded && loaded.region === region ? loaded.holidays : NONE;
};
