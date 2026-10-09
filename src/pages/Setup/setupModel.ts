import {
  BankHolidayRegion,
  CreateAccountInput,
  OneOffPaymentCategory,
  PayFrequency,
  PaydayType,
  PaymentFrequency,
  PaymentType,
  RecurringPaymentCategory,
  Weekday
} from '~/graphql/generated';
import { addDays, parseIsoDate, PaydayConfig } from '~/lib/dates';
import { parseMoney } from '~/lib/format';
import { BankHolidays, getPayCycle, usesWeekday } from '~/lib/payday';
import { occurrencesBetween, PER_MONTH } from '~/lib/payments';

// Setup's answers. Amounts and dates are kept as typed until they're saved.

export interface RegularDraft {
  id: string;
  // Which suggestion added it, so tapping the suggestion again removes it
  preset: string | null;
  name: string;
  amount: string;
  frequency: PaymentFrequency;
  // 'YYYY-MM-DD' of the next payment
  date: string;
  category: RecurringPaymentCategory;
}

export interface OneOffDraft {
  id: string;
  name: string;
  amount: string;
  date: string;
  type: PaymentType;
  category: OneOffPaymentCategory;
}

export interface SetupValues {
  frequency: PayFrequency;
  rule: PaydayType;
  dayOfMonth: string;
  weekday: Weekday;
  firstPayDate: string;
  region: BankHolidayRegion;
  income: string;
  balance: string;
  regulars: RegularDraft[];
  oneOffs: OneOffDraft[];
}

export const INITIAL_VALUES: SetupValues = {
  frequency: 'MONTHLY',
  rule: 'LAST_DAY',
  dayOfMonth: '28',
  weekday: 'FRIDAY',
  firstPayDate: '',
  region: 'ENGLAND_AND_WALES',
  income: '',
  balance: '',
  regulars: [],
  oneOffs: []
};

export const STEPS = [
  {
    title: 'Pay',
    heading: 'When do you get paid?',
    intro: 'This sets the length of each cycle. Your dashboard starts fresh every payday.'
  },
  {
    title: 'Balance',
    heading: "What's in your bank right now?",
    intro: 'Use the balance your banking app shows today. You can correct it every payday.'
  },
  {
    title: 'Regular payments',
    heading: 'Add your regular payments',
    intro:
      'Bills, subscriptions and anything else that goes out on a schedule. Tap a suggestion or add your own.'
  },
  {
    title: 'Coming up',
    heading: 'Anything coming up?',
    intro:
      'One-off payments due soon, like a birthday or a bill you already know about. This step is optional.'
  },
  {
    title: 'Review',
    heading: 'Check and finish',
    intro: 'Make sure this looks right. You can change any of it later.'
  }
] as const;

export const LAST_STEP = STEPS.length - 1;
export const COMING_UP_STEP = 3;
export const MAX_ONE_OFFS = 10;

// The payday choices are shared with Profile
export {
  allowedRules,
  MAIN_FREQUENCIES,
  MORE_FREQUENCIES,
  PAY_FREQUENCY_LABELS,
  REGIONS,
  ruleDescription,
  RULES,
  usesWeekday,
  WEEKDAYS
} from '~/lib/payday';

// The suggestions on the regular payments step
export const PRESETS: { key: string; name: string; category: RecurringPaymentCategory }[] = [
  { key: 'rent', name: 'Rent', category: 'RENT' },
  { key: 'mortgage', name: 'Mortgage', category: 'MORTGAGE' },
  { key: 'counciltax', name: 'Council tax', category: 'TAX' },
  { key: 'energy', name: 'Energy', category: 'UTILITIES' },
  { key: 'water', name: 'Water', category: 'UTILITIES' },
  { key: 'broadband', name: 'Broadband', category: 'UTILITIES' },
  { key: 'mobile', name: 'Mobile', category: 'UTILITIES' },
  { key: 'carins', name: 'Car insurance', category: 'INSURANCE' },
  { key: 'carfin', name: 'Car finance', category: 'VEHICLE' },
  { key: 'netflix', name: 'Netflix', category: 'SUBSCRIPTION' },
  { key: 'spotify', name: 'Spotify', category: 'SUBSCRIPTION' },
  { key: 'gym', name: 'Gym', category: 'MEMBERSHIP' },
  { key: 'credit', name: 'Credit card', category: 'CREDIT_CARD' },
  { key: 'savings', name: 'Savings', category: 'SAVINGS' }
];

const isPositive = (value: string) => (parseMoney(value) ?? 0) > 0;

export const paydayConfig = (values: SetupValues): PaydayConfig => ({
  frequency: values.frequency,
  type: values.rule,
  dayOfMonth: values.rule === 'SET_DAY' ? Number(values.dayOfMonth) : null,
  weekday: usesWeekday(values.rule) ? values.weekday : null,
  firstPayDate: values.frequency === 'MONTHLY' ? null : values.firstPayDate || null,
  bankHolidayRegion: values.region
});

// ---- validation: each returns the messages to show, keyed by field ----

export interface PayErrors {
  dayOfMonth?: string;
  firstPayDate?: string;
  income?: string;
}

export const payErrors = (values: SetupValues): PayErrors => {
  const day = Number(values.dayOfMonth);
  return {
    dayOfMonth:
      values.rule === 'SET_DAY' && !(Number.isInteger(day) && day >= 1 && day <= 31)
        ? 'Choose a day between 1 and 31'
        : undefined,
    firstPayDate:
      values.frequency !== 'MONTHLY' && !values.firstPayDate
        ? 'Add the date of your next pay'
        : undefined,
    income: isPositive(values.income)
      ? undefined
      : 'Enter your take-home pay. It must be more than £0.'
  };
};

export const balanceError = (values: SetupValues) =>
  isPositive(values.balance) ? undefined : 'Enter your current balance. It must be more than £0.';

export type RegularField = 'name' | 'amount' | 'date';

/* Names must be unique across every payment, as the API requires */
const usedNames = (values: SetupValues) => {
  const counts = new Map<string, number>();
  for (const { name } of [...values.regulars, ...values.oneOffs]) {
    const key = name.trim().toLowerCase();
    if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return counts;
};

const DUPLICATE_NAME = "You've already used this name. Names need to be unique.";

export const regularErrors = (regular: RegularDraft, values: SetupValues) => {
  const errors: { field: RegularField; message: string }[] = [];
  const key = regular.name.trim().toLowerCase();
  if (!key) errors.push({ field: 'name', message: 'Give this payment a name' });
  else if ((usedNames(values).get(key) ?? 0) > 1) {
    errors.push({ field: 'name', message: DUPLICATE_NAME });
  }
  if (!isPositive(regular.amount)) {
    errors.push({ field: 'amount', message: 'Add an amount more than £0' });
  }
  if (!regular.date) errors.push({ field: 'date', message: 'Add the date of the next payment' });
  return errors;
};

/* The first problem with a one-off payment before it's added to the list */
export const oneOffError = (draft: Omit<OneOffDraft, 'id'>, values: SetupValues) => {
  const key = draft.name.trim().toLowerCase();
  if (values.oneOffs.length >= MAX_ONE_OFFS)
    return `You can add up to ${MAX_ONE_OFFS} one-off payments`;
  if (!key) return 'Give this payment a name';
  if ((usedNames(values).get(key) ?? 0) > 0) return DUPLICATE_NAME;
  if (!isPositive(draft.amount)) return 'Add an amount more than £0';
  if (!draft.date) return 'Add a due date';
  return undefined;
};

export const isStepValid = (step: number, values: SetupValues) => {
  if (step === 0) return Object.values(payErrors(values)).every(error => !error);
  if (step === 1) return !balanceError(values);
  if (step === 2) return values.regulars.every(regular => !regularErrors(regular, values).length);
  return true;
};

// ---- the first cycle, as the summary beside the form shows it ----

export const summariseFirstCycle = (values: SetupValues, holidays: BankHolidays, today: Date) => {
  const { end: cycleEnd } = getPayCycle(paydayConfig(values), holidays, today);
  const lastDayOfCycle = addDays(cycleEnd, -1);
  const balance = parseMoney(values.balance) ?? 0;

  let regularsDue = 0;
  let regularsDueCount = 0;
  let monthly = 0;
  for (const regular of values.regulars) {
    const amount = parseMoney(regular.amount) ?? 0;
    monthly += amount * PER_MONTH[regular.frequency];
    const first = parseIsoDate(regular.date);
    if (!first) continue;
    const times = occurrencesBetween(
      { firstPaymentDate: first, frequency: regular.frequency },
      today,
      lastDayOfCycle
    ).length;
    if (times > 0) {
      regularsDue += amount * times;
      regularsDueCount++;
    }
  }

  let oneOffsOut = 0;
  let oneOffsIn = 0;
  let oneOffsDueCount = 0;
  for (const oneOff of values.oneOffs) {
    const date = parseIsoDate(oneOff.date);
    if (!date || date < today || date >= cycleEnd) continue;
    const amount = parseMoney(oneOff.amount) ?? 0;
    oneOffsDueCount++;
    if (oneOff.type === 'INCOME') oneOffsIn += amount;
    else oneOffsOut += amount;
  }

  const goingOut = regularsDue + oneOffsOut;
  return {
    cycleEnd,
    balance,
    monthly,
    regularsDue,
    regularsDueCount,
    oneOffsNet: oneOffsIn - oneOffsOut,
    oneOffsDueCount,
    goingOut,
    freeToSpend: balance - regularsDue - oneOffsOut + oneOffsIn,
    spokenForPercent: balance > 0 ? Math.min(100, Math.round((goingOut / balance) * 100)) : 100
  };
};

/* How the first pay cycle looks from the answers, for the review step and its summary */
export type FirstCycle = ReturnType<typeof summariseFirstCycle>;

/* The answers as the API's createAccount input */
export const toCreateAccountInput = (values: SetupValues): CreateAccountInput => {
  const payday = paydayConfig(values);
  return {
    bankBalance: parseMoney(values.balance) ?? 0,
    monthlyIncome: parseMoney(values.income) ?? 0,
    payday: {
      frequency: payday.frequency,
      type: payday.type,
      dayOfMonth: payday.dayOfMonth,
      weekday: payday.weekday,
      firstPayDate: payday.firstPayDate,
      bankHolidayRegion: values.region
    },
    recurringPayments: values.regulars.map(regular => ({
      name: regular.name.trim(),
      amount: parseMoney(regular.amount) ?? 0,
      category: regular.category,
      frequency: regular.frequency,
      type: 'EXPENSE',
      firstPaymentDate: regular.date
    })),
    oneOffPayments: values.oneOffs.map(oneOff => ({
      name: oneOff.name.trim(),
      amount: parseMoney(oneOff.amount) ?? 0,
      dueDate: oneOff.date,
      type: oneOff.type,
      category: oneOff.category
    }))
  };
};
