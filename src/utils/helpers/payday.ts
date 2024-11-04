import { PAY_FREQUENCY, PAYDAY_TYPE_OPTIONS, WEEKDAY } from '~/constants';
import { BANK_HOLIDAY_REGION } from '~/constants/bankHolidays';
import { PayFrequency } from '~/types';

const formatLabel = (value: string) => {
  // Handles special cases first
  if (value === 'FOUR_WEEKLY') return '4 Weekly';

  // General case: convert "SNAKE_CASE" to "Title Case"
  return value
    .toLowerCase()
    .split('_')
    .map(word => {
      if (word === 'and') return '&';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
};

export const getFrequencyOptions = () =>
  Object.values(PAY_FREQUENCY).map(value => ({
    value,
    label: formatLabel(value)
  }));

export const getWeekdayOptions = () =>
  Object.values(WEEKDAY)
    .filter(value => value !== 'SATURDAY' && value !== 'SUNDAY')
    .map(value => ({
      value,
      label: formatLabel(value)
    }));

export const getBankHolidayRegionOptions = () =>
  Object.values(BANK_HOLIDAY_REGION).map(value => ({
    value,
    label: formatLabel(value)
  }));

export const getPaydayTypeOptions = (frequency: PayFrequency) => {
  const options = (() => {
    switch (frequency) {
      case PAY_FREQUENCY.WEEKLY:
        return PAYDAY_TYPE_OPTIONS.WEEKLY;
      case PAY_FREQUENCY.FORTNIGHTLY:
      case PAY_FREQUENCY.FOUR_WEEKLY:
        return PAYDAY_TYPE_OPTIONS.RECURRING;
      default:
        return PAYDAY_TYPE_OPTIONS.DEFAULT;
    }
  })();

  return options.map(({ value }) => ({
    value,
    label: formatLabel(value)
  }));
};
