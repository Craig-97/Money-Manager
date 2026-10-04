import { BankHolidayRegion, PayFrequency, PaydayType, Weekday } from '~/graphql/generated';

// The ways someone can be paid, as offered in setup and on the profile page

export const PAY_FREQUENCY_LABELS: Record<PayFrequency, string> = {
  WEEKLY: 'Weekly',
  FORTNIGHTLY: 'Fortnightly',
  FOUR_WEEKLY: 'Four-weekly',
  MONTHLY: 'Monthly',
  QUARTERLY: 'Quarterly',
  BIANNUAL: 'Every 6 months',
  ANNUAL: 'Yearly'
};

// Shown as buttons; the rest sit under "More"
export const MAIN_FREQUENCIES: PayFrequency[] = ['WEEKLY', 'FORTNIGHTLY', 'FOUR_WEEKLY', 'MONTHLY'];
export const MORE_FREQUENCIES: PayFrequency[] = ['QUARTERLY', 'BIANNUAL', 'ANNUAL'];

export const RULES: Record<PaydayType, { title: string; description: string }> = {
  LAST_DAY: { title: 'Last working day', description: 'The final weekday of the month' },
  LAST_FRIDAY: { title: 'Last Friday', description: 'The last Friday of the month' },
  SET_DAY: { title: 'Set day', description: 'The same date every month' },
  SET_WEEKDAY: { title: 'Set weekday', description: 'The same day of the week' }
};

/* Which payday rules make sense for how often someone is paid */
export const allowedRules = (frequency: PayFrequency): PaydayType[] => {
  if (frequency === 'WEEKLY') return ['SET_WEEKDAY'];
  if (frequency === 'FORTNIGHTLY' || frequency === 'FOUR_WEEKLY') {
    return ['LAST_DAY', 'LAST_FRIDAY', 'SET_WEEKDAY'];
  }
  return ['LAST_DAY', 'LAST_FRIDAY', 'SET_DAY'];
};

export const ruleDescription = (rule: PaydayType, frequency: PayFrequency) => {
  if (rule !== 'SET_WEEKDAY') return RULES[rule].description;
  return frequency === 'WEEKLY' ? 'The same day each week' : 'Pick the weekday below';
};

export const WEEKDAYS: { value: Weekday; short: string; long: string }[] = [
  { value: 'MONDAY', short: 'Mon', long: 'Monday' },
  { value: 'TUESDAY', short: 'Tue', long: 'Tuesday' },
  { value: 'WEDNESDAY', short: 'Wed', long: 'Wednesday' },
  { value: 'THURSDAY', short: 'Thu', long: 'Thursday' },
  { value: 'FRIDAY', short: 'Fri', long: 'Friday' }
];

export const REGIONS: { value: BankHolidayRegion; label: string }[] = [
  { value: 'ENGLAND_AND_WALES', label: 'England & Wales' },
  { value: 'SCOTLAND', label: 'Scotland' },
  { value: 'NORTHERN_IRELAND', label: 'Northern Ireland' }
];
