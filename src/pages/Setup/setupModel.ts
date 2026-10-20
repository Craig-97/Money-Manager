import { AccountDraft, checkAccountDraft } from '~/components/accounts';
import {
  BankHolidayRegion,
  CreateBudgetInput,
  OneOffPaymentInput,
  PayFrequency,
  PaydayType,
  RecurringPaymentCategory,
  RecurringPaymentInput,
  Weekday
} from '~/graphql/generated';
import { addDays, parseIsoDate, PaydayConfig } from '~/lib/dates';
import { parseMoney } from '~/lib/format';
import { BankHolidays, getPayCycle, usesWeekday } from '~/lib/payday';
import { occurrencesBetween, PER_MONTH } from '~/lib/payments';

// Setup's answers. The pay and the first account are kept as typed until they're saved; other
// accounts as their dialog's draft, and payments as the API will take them.

// The key payments use for the account pay lands in, as the API's createBudget takes it
export const PAID_INTO_KEY = 'paid-into';

export interface SetupAccount {
  // How payments set up alongside it name it
  key: string;
  draft: AccountDraft;
}

export interface SetupRegular {
  id: string;
  // Which suggestion added it, so tapping the suggestion again opens it
  preset: string | null;
  input: RecurringPaymentInput;
}

export interface SetupOneOff {
  id: string;
  input: OneOffPaymentInput;
}

export interface SetupValues {
  frequency: PayFrequency;
  rule: PaydayType;
  dayOfMonth: string;
  weekday: Weekday;
  firstPayDate: string;
  region: BankHolidayRegion;
  income: string;
  // The account pay lands in
  paidIntoName: string;
  balance: string;
  accounts: SetupAccount[];
  regulars: SetupRegular[];
  oneOffs: SetupOneOff[];
}

export const INITIAL_VALUES: SetupValues = {
  frequency: 'MONTHLY',
  rule: 'LAST_DAY',
  dayOfMonth: '28',
  weekday: 'FRIDAY',
  firstPayDate: '',
  region: 'ENGLAND_AND_WALES',
  income: '',
  paidIntoName: 'Current account',
  balance: '',
  accounts: [],
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
    title: 'Your accounts',
    heading: 'Where do you keep your money?',
    intro:
      'The account your pay goes into, and any others. Use the balances your banking app shows today.'
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

export interface AccountsErrors {
  paidIntoName?: string;
  balance?: string;
}

export const accountsErrors = (values: SetupValues): AccountsErrors => ({
  paidIntoName: values.paidIntoName.trim() ? undefined : 'Give the account a name',
  balance: isPositive(values.balance)
    ? undefined
    : 'Enter your current balance. It must be more than £0.'
});

/*
 * Why a payment can't be added or saved: names must be unique across every payment, as the API
 * requires, and there's a limit on one-offs. `id` is the payment being changed, if any.
 */
export const paymentProblem = (
  values: SetupValues,
  { name, id, oneOff }: { name: string; id?: string; oneOff: boolean }
) => {
  const key = name.trim().toLowerCase();
  const taken = [...values.regulars, ...values.oneOffs].some(
    payment => payment.id !== id && payment.input.name.trim().toLowerCase() === key
  );
  if (taken) return "You've already used this name. Names need to be unique.";
  if (oneOff && !id && values.oneOffs.length >= MAX_ONE_OFFS) {
    return `You can add up to ${MAX_ONE_OFFS} one-off payments`;
  }
  return undefined;
};

export const isStepValid = (step: number, values: SetupValues) => {
  if (step === 0) return Object.values(payErrors(values)).every(error => !error);
  if (step === 1) return Object.values(accountsErrors(values)).every(error => !error);
  return true;
};

// ---- the accounts, as the payment form and the sums see them ----

export interface SetupAccountView {
  id: string;
  name: string;
  kind: AccountDraft['kind'];
  counts: boolean;
  paidInto: boolean;
  balance: number;
  draft: AccountDraft | null;
}

/* Where pay lands first, then the other accounts as added */
export const setupAccounts = (values: SetupValues): SetupAccountView[] => [
  {
    id: PAID_INTO_KEY,
    name: values.paidIntoName.trim() || 'Current account',
    kind: 'SPENDING',
    counts: true,
    paidInto: true,
    balance: parseMoney(values.balance) ?? 0,
    draft: null
  },
  ...values.accounts.map(({ key, draft }) => ({
    id: key,
    name: draft.name.trim(),
    kind: draft.kind,
    counts: draft.kind === 'SPENDING' || draft.counts,
    paidInto: false,
    balance: parseMoney(draft.balance) ?? 0,
    draft
  }))
];

// Paid every three months or less often: kept apart from the monthly figure, never averaged in
const YEARLY_FREQUENCIES = ['QUARTERLY', 'BIANNUALLY', 'ANNUALLY'];

// ---- the first cycle, as the summary beside the form shows it ----

export const summariseFirstCycle = (
  values: SetupValues,
  { holidays, today }: { holidays: BankHolidays; today: Date }
) => {
  const { end: cycleEnd } = getPayCycle(paydayConfig(values), { holidays, today });
  const lastDayOfCycle = addDays(cycleEnd, -1);
  const accounts = setupAccounts(values);
  const counted = accounts.filter(account => account.counts);
  const balance = counted.reduce((total, account) => total + account.balance, 0);
  const counts = (key: string | null | undefined) =>
    counted.some(account => account.id === (key || PAID_INTO_KEY));
  // What a payment does to free to spend: off (or onto) the account it uses when that counts, and
  // onto the one it moves money into when that counts. Between two that count, nothing.
  const effectOf = (input: {
    amount: number;
    type: string;
    account?: string | null;
    paysInto?: string | null;
  }) =>
    (counts(input.account) ? (input.type === 'INCOME' ? input.amount : -input.amount) : 0) +
    (input.paysInto && counts(input.paysInto) ? input.amount : 0);

  let regularsNet = 0;
  let regularsDueCount = 0;
  let monthly = 0;
  let yearly = 0;
  let goingOut = 0;
  for (const { input } of values.regulars) {
    // Money moving between accounts that both count isn't spending
    const moving = !!input.paysInto && counts(input.paysInto);
    if (input.type === 'EXPENSE' && !moving) {
      if (YEARLY_FREQUENCIES.includes(input.frequency)) {
        yearly += input.amount * PER_MONTH[input.frequency] * 12;
      } else {
        monthly += input.amount * PER_MONTH[input.frequency];
      }
    }
    const first = parseIsoDate(input.firstPaymentDate);
    if (!first) continue;
    const times = occurrencesBetween(
      { firstPaymentDate: first, frequency: input.frequency },
      { from: today, to: lastDayOfCycle }
    ).length;
    if (times > 0) {
      const effect = effectOf(input) * times;
      regularsNet += effect;
      if (effect < 0) goingOut -= effect;
      regularsDueCount++;
    }
  }

  let oneOffsNet = 0;
  let oneOffsDueCount = 0;
  for (const { input } of values.oneOffs) {
    const date = parseIsoDate(input.dueDate);
    if (!date || date < today || date >= cycleEnd) continue;
    const effect = effectOf(input);
    oneOffsDueCount++;
    oneOffsNet += effect;
    if (effect < 0) goingOut -= effect;
  }

  return {
    cycleEnd,
    balance,
    // How many accounts make the balance
    countedCount: counted.length,
    monthly,
    yearly,
    regularsNet,
    regularsDueCount,
    oneOffsNet,
    oneOffsDueCount,
    goingOut,
    freeToSpend: balance + regularsNet + oneOffsNet,
    spokenForPercent: balance > 0 ? Math.min(100, Math.round((goingOut / balance) * 100)) : 100
  };
};

/* How the first pay cycle looks from the answers, for the review step and its summary */
export type FirstCycle = ReturnType<typeof summariseFirstCycle>;

/* The answers as the API's createBudget input */
export const toCreateBudgetInput = (values: SetupValues): CreateBudgetInput => {
  const payday = paydayConfig(values);
  return {
    bankBalance: parseMoney(values.balance) ?? 0,
    paidIntoName: values.paidIntoName.trim() || 'Current account',
    accounts: values.accounts.flatMap(({ key, draft }) => {
      const { fields } = checkAccountDraft(draft, { submitted: true });
      return fields ? [{ key, kind: draft.kind, ...fields }] : [];
    }),
    monthlyIncome: parseMoney(values.income) ?? 0,
    payday: {
      frequency: payday.frequency,
      type: payday.type,
      dayOfMonth: payday.dayOfMonth,
      weekday: payday.weekday,
      firstPayDate: payday.firstPayDate,
      bankHolidayRegion: values.region
    },
    recurringPayments: values.regulars.map(regular => regular.input),
    oneOffPayments: values.oneOffs.map(oneOff => oneOff.input)
  };
};
