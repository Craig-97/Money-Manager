import { PaydayConfig } from '~/lib/dates';
import { PAY_FREQUENCY_LABELS, REGIONS, WEEKDAYS } from './options';

const paydayRule = ({ type, weekday }: PaydayConfig) => {
  const day = WEEKDAYS.find(item => item.value === weekday)?.long;
  switch (type) {
    case 'LAST_DAY':
      return 'last working day';
    case 'LAST_WEEKDAY':
      return `last ${day ?? 'Friday'}`;
    case 'SET_DAY':
      return 'set day';
    case 'SET_WEEKDAY':
      return 'set weekday';
  }
};

/* "Monthly · last Friday · Scotland bank holidays" */
export const paydayText = (payday: PaydayConfig | null | undefined) => {
  if (!payday) return 'Monthly · last working day';
  const parts = [PAY_FREQUENCY_LABELS[payday.frequency], paydayRule(payday)];
  const region = REGIONS.find(item => item.value === payday.bankHolidayRegion)?.label;
  if (region) parts.push(`${region} bank holidays`);
  return parts.join(' · ');
};

/* "Paid monthly · last Friday" */
export const paidText = (payday: PaydayConfig | null | undefined) =>
  payday
    ? `Paid ${PAY_FREQUENCY_LABELS[payday.frequency].toLowerCase()} · ${paydayRule(payday)}`
    : 'Paid monthly · last working day';
