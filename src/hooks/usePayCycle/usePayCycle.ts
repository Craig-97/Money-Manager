import { PaydayFieldsFragment } from '~/graphql/generated';
import { useBankHolidays } from '~/hooks/useBankHolidays';
import { startOfToday } from '~/lib/dates';
import { getPayCycle } from '~/lib/payday';

// Used when an account has no payday saved: paid on the last working day of the month
const DEFAULT_PAYDAY = { frequency: 'MONTHLY', type: 'LAST_DAY' } as const;

/* Today and the pay cycle it falls in, from the account's payday */
export const usePayCycle = (payday: PaydayFieldsFragment | null | undefined) => {
  const holidays = useBankHolidays(payday?.bankHolidayRegion);
  const today = startOfToday();

  return { today, holidays, cycle: getPayCycle(payday ?? DEFAULT_PAYDAY, holidays, today) };
};
