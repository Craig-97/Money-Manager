import {
  BankHolidayRegion,
  PayFrequency,
  PaydayFieldsFragment,
  PaydayInput,
  PaydayType,
  Weekday
} from '~/graphql/generated';
import { daysBetween, fromApiDate, PaydayConfig, toIsoDate } from '~/lib/dates';
import {
  allowedRules,
  BankHolidays,
  getNextPaydayDates,
  getNextPaydays,
  PAY_FREQUENCY_LABELS,
  usesWeekday,
  WEEKDAYS
} from '~/lib/payday';

export type SectionId = 'personal' | 'password' | 'payday' | 'balances' | 'appearance' | 'account';

// The settings sections, in page order. `short` is the mobile jump chip.
export const SECTIONS: { id: SectionId; label: string; short: string }[] = [
  { id: 'personal', label: 'Personal details', short: 'Details' },
  { id: 'password', label: 'Password', short: 'Password' },
  { id: 'payday', label: 'Payday', short: 'Payday' },
  { id: 'balances', label: 'Balances', short: 'Balances' },
  { id: 'appearance', label: 'Appearance', short: 'Appearance' },
  { id: 'account', label: 'Account', short: 'Account' }
];

// ---- password strength ----

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'] as const;

/*
 * A rough 0-4 score: one each for 8+ characters, a number, mixed case, and a symbol or 12+
 * characters. The API only insists on the first two.
 */
export const passwordStrength = (password: string) => {
  if (!password) return { score: 0, label: '' };
  const score = [
    password.length >= 8,
    /[0-9]/.test(password),
    /[a-z]/.test(password) && /[A-Z]/.test(password),
    /[^A-Za-z0-9]/.test(password) || password.length >= 12
  ].filter(Boolean).length;
  return { score, label: STRENGTH_LABELS[Math.max(score, 1)] };
};

// ---- payday ----

// The payday form, with the day kept as typed
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
export const withFrequency = (values: PaydayValues, frequency: PayFrequency): PaydayValues => {
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

const PREVIEW_COUNT = 3;
const NO_HOLIDAYS: BankHolidays = new Set();

export interface PaydayPreview {
  date: Date;
  // The date the rule gives (bank holidays allowed for), which a move by the user attaches to
  usual: Date;
  // Moved by the user from `usual`
  moved: boolean;
  // The date it would have been, when a bank holiday moved it
  movedFrom: Date | null;
}

/* The next few paydays, marking any a bank holiday or the user moved */
export const paydayPreview = (
  config: PaydayConfig,
  holidays: BankHolidays,
  today: Date
): PaydayPreview[] => {
  // Weekends are allowed for in both lists, so any difference is a bank holiday
  const before = getNextPaydays({ ...config, overrides: [] }, NO_HOLIDAYS, today, PREVIEW_COUNT);
  return getNextPaydayDates(config, holidays, today, PREVIEW_COUNT).map(
    ({ date, usual }, index) => {
      const original = before[index];
      const heldBack =
        !usual && original && original > date && daysBetween(date, original) < 7 ? original : null;
      return { date, usual: usual ?? date, moved: !!usual, movedFrom: heldBack };
    }
  );
};

const ordinal = (day: number) => {
  const tens = day % 100;
  if (tens >= 11 && tens <= 13) return `${day}th`;
  return `${day}${['th', 'st', 'nd', 'rd'][day % 10] ?? 'th'}`;
};

/* "Paid monthly · last Friday", for the summary at the top */
export const paydayPlan = (payday: PaydayFieldsFragment | null | undefined) => {
  const values = toPaydayValues(payday);
  const often = PAY_FREQUENCY_LABELS[values.frequency].toLowerCase();
  const weekday = WEEKDAYS.find(day => day.value === values.weekday)?.long ?? 'Friday';
  const day: Record<PaydayType, string> = {
    LAST_DAY: 'last working day',
    LAST_WEEKDAY: `last ${weekday}`,
    SET_DAY: `the ${ordinal(Number(values.dayOfMonth) || 1)}`,
    SET_WEEKDAY: `${weekday}s`
  };
  return `Paid ${often} · ${day[values.rule]}`;
};
