import { formatMonthYear } from '~/lib/dates';
import {
  clearedText,
  DebtPayment,
  extraPerPayment,
  monthFromNow,
  monthlyPayment,
  Payoff,
  payoffOrder,
  PayoffStrategy,
  simulatePayoff
} from '~/lib/debts';
import { formatMoney } from '~/lib/format';

/* The payoff plan's choices: what happens to a cleared debt's payment */
export const STRATEGIES: Record<PayoffStrategy, { short: string; label: string; blurb: string }> = {
  avalanche: {
    short: 'Avalanche',
    label: 'Highest rate first',
    blurb:
      'When a debt is cleared, its payment moves to the one with the highest rate. You pay the least interest.'
  },
  snowball: {
    short: 'Snowball',
    label: 'Smallest first',
    blurb:
      'When a debt is cleared, its payment moves to the smallest balance. You clear debts sooner, which keeps you going.'
  },
  keep: {
    short: 'Keep as is',
    label: 'Keep as is',
    blurb:
      'Each debt keeps its own payment. When one is cleared, that money goes back into your free to spend.'
  }
};

export const STRATEGY_OPTIONS = (['avalanche', 'snowball', 'keep'] as const).map(value => ({
  value,
  label: STRATEGIES[value].short
}));

// What extra a month the plan can try
export const EXTRA_CHOICES = [0, 50, 100, 200] as const;

export const extraLabel = (extra: number) =>
  extra ? `+${formatMoney(extra, { whole: true })}` : 'Nothing extra';

export type DebtSort = 'rate' | 'left' | 'least' | 'soonest' | 'name';

export const DEBT_SORTS: { value: DebtSort; label: string }[] = [
  { value: 'rate', label: 'Highest rate' },
  { value: 'left', label: 'Most left' },
  { value: 'least', label: 'Least left' },
  { value: 'soonest', label: 'Cleared soonest' },
  { value: 'name', label: 'Name' }
];

export const sortLabelOf = (sort: DebtSort) => DEBT_SORTS.find(s => s.value === sort)!.label;

/* The debts in the chosen order; ties go by name */
export const sortDebts = (
  debts: readonly DebtPayment[],
  sort: DebtSort,
  clearedIn: Record<string, number | null>
) => {
  // A debt that never clears at its payment goes last when sorting by when they clear
  const cleared = (debt: DebtPayment) => clearedIn[debt.id] ?? Number.POSITIVE_INFINITY;
  const by: Record<DebtSort, (a: DebtPayment, b: DebtPayment) => number> = {
    rate: (a, b) => b.debt.apr - a.debt.apr,
    left: (a, b) => b.debt.balance - a.debt.balance,
    least: (a, b) => a.debt.balance - b.debt.balance,
    soonest: (a, b) => cleared(a) - cleared(b),
    name: () => 0
  };
  return debts.toSorted((a, b) => by[sort](a, b) || a.name.localeCompare(b.name));
};

const monthsText = (months: number) => `${months} ${months === 1 ? 'month' : 'months'}`;

export interface PlanFigures {
  // As things are: each debt keeps its payment and nothing extra is paid
  base: Payoff;
  plan: Payoff;
  baseFreeBy: string;
  freeBy: string;
  // "11 months sooner", "Same as now"
  sooner: string;
  interest: number;
  // "£308 less than now"
  saved: string;
  monthly: number;
  monthlySub: string;
  // Each debt in the order the plan clears them, with when
  order: { id: string; name: string; when: string }[];
  // Where the extra goes when it's applied: the first debt in the order with something left
  target: DebtPayment | null;
}

/* The payoff plan worked out for a strategy and some extra a month, against how things are now */
export const planFigures = (
  debts: readonly DebtPayment[],
  strategy: PayoffStrategy,
  extra: number,
  today: Date,
  base: Payoff
): PlanFigures => {
  const plan = simulatePayoff(debts, { strategy, extra });
  const ids = payoffOrder(debts, strategy);
  const byId = new Map(debts.map(debt => [debt.id, debt]));
  const diff = base.months !== null && plan.months !== null ? base.months - plan.months : 0;
  const saved = Math.round(base.interest - plan.interest);
  const monthly = debts.reduce((sum, debt) => sum + monthlyPayment(debt), 0);

  return {
    base,
    plan,
    baseFreeBy: clearedText(base.months, today),
    freeBy: clearedText(plan.months, today),
    sooner:
      base.months === null && plan.months !== null
        ? 'Cleared at last'
        : diff > 0
          ? `${monthsText(diff)} sooner`
          : 'Same as now',
    interest: plan.interest,
    saved: saved > 0 ? `${formatMoney(saved, { whole: true })} less than now` : 'Same as now',
    monthly: monthly + extra,
    monthlySub: extra
      ? `${formatMoney(monthly, { whole: true })} + ${formatMoney(extra, { whole: true })} extra`
      : 'What you pay now',
    order: ids.map(id => ({
      id,
      name: byId.get(id)!.name,
      when: clearedText(plan.clearedIn[id], today)
    })),
    target: ids.map(id => byId.get(id)!).find(debt => debt.debt.balance > 0 && debt.dueDate) ?? null
  };
};

const MONTH_NAME = new Intl.DateTimeFormat('en-GB', { month: 'long' });

/* What applying the extra does: the target debt's payment goes up from its next one */
export const applyChange = (target: DebtPayment, extra: number) => {
  const amount = Math.round((target.amount + extraPerPayment(target, extra)) * 100) / 100;
  const from = target.dueDate ? MONTH_NAME.format(target.dueDate) : 'now';
  return { amount, from };
};

/* The chart's words: where it starts, where the slower line ends, and the whole thing read out */
export const chartText = (figures: PlanFigures, today: Date, left: number) => {
  const { base, plan } = figures;
  const longest = Math.max(base.series.length, plan.series.length) - 1;
  return {
    start: `${formatMonthYear(today)} · ${formatMoney(left, { whole: true })}`,
    end: formatMonthYear(monthFromNow(today, longest)),
    label:
      plan.months === null
        ? `What's left stays above nothing for as far as the chart goes`
        : `What's left falls from ${formatMoney(left, { whole: true })} to nothing by ${figures.freeBy}, against ${figures.baseFreeBy} as you are now`
  };
};

/* The mobile hero's chips: the biggest balances first, named by their first word */
export const biggestDebts = (debts: readonly DebtPayment[], count = 3) =>
  debts
    .toSorted((a, b) => b.debt.balance - a.debt.balance)
    .slice(0, count)
    .map(debt => ({ id: debt.id, label: debt.name.split(' ')[0], balance: debt.debt.balance }));
