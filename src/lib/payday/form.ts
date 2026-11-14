import {
  BankHolidayRegion,
  PayFrequency,
  PaydayFieldsFragment,
  PaydayInput,
  PaydayType,
  Weekday
} from '~/graphql/generated';
import { fromApiDate, PaydayConfig, toIsoDate } from '~/lib/dates';
import { allowedRules, usesWeekday } from './options';

// The payday form, as Setup and Profile both ask it

// The form's answers, with the day kept as typed
export interface PaydayValues {
  frequency: PayFrequency;
  rule: PaydayType;
  dayOfMonth: string;
  weekday: Weekday;
  // 'YYYY-MM-DD', or '' when not set
  firstPayDate: string;
  region: BankHolidayRegion;
}

export const toPaydayValues = (payday: PaydayFieldsFragment | null | undefined): PaydayValues => {
  const firstPayDate = fromApiDate(payday?.firstPayDate);
  return {
    frequency: payday?.frequency ?? 'MONTHLY',
    rule: payday?.type ?? 'LAST_DAY',
    dayOfMonth: payday?.dayOfMonth ? String(payday.dayOfMonth) : '',
    weekday: payday?.weekday ?? 'FRIDAY',
    firstPayDate: firstPayDate ? toIsoDate(firstPayDate) : '',
    region: payday?.bankHolidayRegion ?? 'ENGLAND_AND_WALES'
  };
};

/* Changing how often you're paid keeps the rule if it still applies, else picks the first that does */
export const withFrequency = <T extends PaydayValues>(values: T, frequency: PayFrequency): T => {
  const rules = allowedRules(frequency);
  return { ...values, frequency, rule: rules.includes(values.rule) ? values.rule : rules[0] };
};

export const toPaydayConfig = (
  values: PaydayValues,
  overrides: PaydayConfig['overrides'] = []
): PaydayConfig => ({
  frequency: values.frequency,
  type: values.rule,
  dayOfMonth: values.rule === 'SET_DAY' ? Number(values.dayOfMonth) : null,
  weekday: usesWeekday(values.rule) ? values.weekday : null,
  firstPayDate: values.frequency === 'MONTHLY' ? null : values.firstPayDate || null,
  bankHolidayRegion: values.region,
  overrides
});

export const toPaydayInput = (values: PaydayValues): PaydayInput => {
  const config = toPaydayConfig(values);
  return {
    frequency: config.frequency,
    type: config.type,
    dayOfMonth: config.dayOfMonth,
    weekday: config.weekday,
    firstPayDate: config.firstPayDate,
    bankHolidayRegion: values.region
  };
};

export interface PaydayErrors {
  dayOfMonth?: string;
  firstPayDate?: string;
}

export const paydayErrors = (values: PaydayValues): PaydayErrors => {
  const day = Number(values.dayOfMonth);
  return {
    dayOfMonth:
      values.rule === 'SET_DAY' && !(Number.isInteger(day) && day >= 1 && day <= 31)
        ? 'Choose a day between 1 and 31'
        : undefined,
    firstPayDate:
      values.frequency !== 'MONTHLY' && !values.firstPayDate
        ? 'Add the date of your next pay'
        : undefined
  };
};
