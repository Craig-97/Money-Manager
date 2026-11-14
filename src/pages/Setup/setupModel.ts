import { AccountDraft, checkAccountDraft } from '~/components/accounts';
import {
  CreateBudgetInput,
  OneOffPaymentInput,
  PaymentType,
  PaymentCategory,
  RecurringPaymentInput
} from '~/graphql/generated';
import { addDays, parseIsoDate, startOfToday } from '~/lib/dates';
import { formatMoney, MINUS, parseMoney } from '~/lib/format';
import {
  BankHolidays,
  getPayCycle,
  PAY_FREQUENCY_LABELS,
  paydayErrors,
  PaydayErrors,
  PaydayValues,
  RULES,
  toPaydayConfig,
  toPaydayInput
} from '~/lib/payday';
import { isYearly, occurrencesBetween, PER_MONTH, PER_YEAR } from '~/lib/payments';

// Setup's answers. The pay and the first account are kept as typed until they're saved; other
// accounts as their dialog's draft, and payments as the API will take them.

// The key payments use for the account pay lands in, as the API's createBudget takes it
export const PAID_INTO_KEY = 'paid-into';

interface SetupAccount {
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

// The payday answers, as Profile asks them, then the rest of setup
export interface SetupValues extends PaydayValues {
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

// Each step's title, heading and intro. Mobile words some of them for the narrower screen.
interface StepCopy {
  title: string;
  heading: string;
  intro: string;
  mobileHeading?: string;
  mobileIntro?: string;
}

export const STEPS: StepCopy[] = [
  {
    title: 'Pay',
    heading: 'When do you get paid?',
    intro: 'This sets the length of each cycle. Your dashboard starts fresh every payday.'
  },
  {
    title: 'Your accounts',
    heading: 'Where do you keep your money?',
    intro:
      'Start with the account you get paid into. Use the balances your banking app shows today.',
    mobileHeading: 'Your accounts',
    mobileIntro:
      'Start with the account your pay goes into, then any savings you want to keep an eye on.'
  },
  {
    title: 'Regular payments',
    heading: 'Add your regular payments',
    intro:
      'Bills, subscriptions and anything else that goes out or comes in on a schedule. Tap a suggestion or add your own.',
    mobileIntro:
      'Bills, subscriptions, income and anything else on a schedule. Tap a suggestion or add your own.'
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
];

// Setup's desktop layout, with the steps down the side, from 860px
export const SETUP_DESKTOP = '(min-width: 53.75rem)';

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

// The suggestions on the regular payments step. Each starts the payment form as money out or in.
interface Preset {
  key: string;
  name: string;
  category: PaymentCategory;
  type: PaymentType;
}

// Money out, as key, name and category
const SPENDING_PRESETS: [string, string, PaymentCategory][] = [
  ['rent', 'Rent', 'BILLS'],
  ['mortgage', 'Mortgage', 'BILLS'],
  ['counciltax', 'Council tax', 'BILLS'],
  ['energy', 'Energy', 'BILLS'],
  ['water', 'Water', 'BILLS'],
  ['broadband', 'Broadband', 'BILLS'],
  ['mobile', 'Mobile', 'BILLS'],
  ['carins', 'Car insurance', 'FINANCES'],
  ['carfin', 'Car finance', 'FINANCES'],
  ['netflix', 'Netflix', 'SUBSCRIPTIONS'],
  ['spotify', 'Spotify', 'SUBSCRIPTIONS'],
  ['gym', 'Gym', 'SUBSCRIPTIONS'],
  ['credit', 'Credit card', 'FINANCES'],
  ['isa', 'ISA top-up', 'SAVINGS']
];

export const PRESETS: Preset[] = [
  ...SPENDING_PRESETS.map(([key, name, category]): Preset => ({
    key,
    name,
    category,
    type: 'EXPENSE'
  })),
  { key: 'childbenefit', name: 'Child Benefit', category: 'INCOME', type: 'INCOME' }
];

const isPositive = (value: string) => (parseMoney(value) ?? 0) > 0;

/* "Monthly · last working day": how often and the rule, as the steps sum it up */
export const payRuleText = ({ frequency, rule }: Pick<SetupValues, 'frequency' | 'rule'>) =>
  `${PAY_FREQUENCY_LABELS[frequency]} · ${RULES[rule].title.toLowerCase()}`;

/* "+£20.00" for money in; money out is signed on a phone, as its board has it, and red alone on desktop */
export const setupAmount = (
  input: { amount: number; type: string },
  { desktop }: { desktop: boolean }
) => (input.type === 'INCOME' ? '+' : desktop ? '' : MINUS) + formatMoney(input.amount);

// ---- validation: each returns the messages to show, keyed by field ----

export interface PayErrors extends PaydayErrors {
  income?: string;
}

export const payErrors = (values: SetupValues): PayErrors => {
  return {
    ...paydayErrors(values),
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

// "Spending · Shared household bills", "Savings · 4.5% · Counts in free to spend"
export const accountDetails = (account: SetupAccountView) =>
  [
    account.kind === 'SPENDING' ? 'Spending' : 'Savings',
    account.kind === 'SAVINGS' && account.draft?.interest.rate.trim()
      ? `${account.draft.interest.rate.replace(/[%\s]/g, '')}%`
      : null,
    account.draft?.purpose.trim() || null,
    account.kind === 'SAVINGS' && account.counts ? 'Counts in free to spend' : null
  ]
    .filter(Boolean)
    .join(' · ');

// Paid every three months or less often: kept apart from the monthly figure, never averaged in
// ---- the first cycle, as the summary beside the form shows it ----

export const summariseFirstCycle = (
  values: SetupValues,
  { holidays, today }: { holidays: BankHolidays; today: Date }
) => {
  const { end: cycleEnd } = getPayCycle(toPaydayConfig(values), { holidays, today });
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

  // Regular payments due this cycle, split into money out and money in, as the summary lists them
  let regularsOut = 0;
  let regularsOutCount = 0;
  let regularsIn = 0;
  let regularsInCount = 0;
  let monthly = 0;
  let yearly = 0;
  let goingOut = 0;
  let comingIn = 0;
  for (const { input } of values.regulars) {
    // Money moving between accounts that both count isn't spending
    const moving = !!input.paysInto && counts(input.paysInto);
    if (input.type === 'EXPENSE' && !moving) {
      if (isYearly(input.frequency)) {
        yearly += input.amount * PER_YEAR[input.frequency];
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
    const effect = effectOf(input) * times;
    if (effect < 0) {
      regularsOut -= effect;
      regularsOutCount++;
    } else if (effect > 0) {
      regularsIn += effect;
      regularsInCount++;
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
    else comingIn += effect;
  }
  goingOut += regularsOut;
  comingIn += regularsIn;
  const regularsNet = regularsIn - regularsOut;

  return {
    cycleEnd,
    today,
    balance,
    // How many accounts make the balance
    countedCount: counted.length,
    // Savings left out of free to spend, named under the summary
    keptOut: accounts.filter(account => !account.counts),
    monthly,
    yearly,
    regularsOut,
    regularsOutCount,
    regularsIn,
    regularsInCount,
    oneOffsNet,
    oneOffsDueCount,
    goingOut,
    comingIn,
    freeToSpend: balance + regularsNet + oneOffsNet,
    spokenForPercent: balance > 0 ? Math.min(100, Math.round((goingOut / balance) * 100)) : 100
  };
};

/* How the first pay cycle looks from the answers, for the review step and its summary */
export type FirstCycle = ReturnType<typeof summariseFirstCycle>;

/* The answers as the API's createBudget input */
export const toCreateBudgetInput = (values: SetupValues): CreateBudgetInput => {
  return {
    bankBalance: parseMoney(values.balance) ?? 0,
    paidIntoName: values.paidIntoName.trim() || 'Current account',
    accounts: values.accounts.flatMap(({ key, draft }) => {
      const { fields } = checkAccountDraft(draft, { submitted: true, today: startOfToday() });
      return fields ? [{ key, kind: draft.kind, ...fields }] : [];
    }),
    monthlyIncome: parseMoney(values.income) ?? 0,
    payday: toPaydayInput(values),
    recurringPayments: values.regulars.map(regular => regular.input),
    oneOffPayments: values.oneOffs.map(oneOff => oneOff.input)
  };
};
