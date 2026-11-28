import { forFreeToSpend } from '~/lib/accounts';
import { formatMoney, roundPence } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import {
  activeRecurringCount,
  categoryLabel,
  isInCycle,
  isYearly,
  movesTo,
  PaymentSort,
  PER_MONTH,
  PER_YEAR,
  RecurringPayment,
  RenewalChange,
  renewalChangeOf,
  renewalWindow,
  sortPayments,
  summarise
} from '~/lib/payments';

export type RecurringTab = 'all' | 'cycle' | 'renewals';

const RECURRING_TABS: { value: RecurringTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'cycle', label: 'Before payday' },
  { value: 'renewals', label: 'Renewals' }
];

export const ALL_CATEGORIES = 'ALL';

interface RecurringFilters {
  tab: RecurringTab;
  query: string;
  // A RecurringPaymentCategory, or ALL_CATEGORIES
  category: string;
}

// Whether a tab lists a payment
const inTab = (
  payment: RecurringPayment,
  { tab, cycle, today }: { tab: RecurringTab; cycle: PayCycle; today: Date }
) =>
  tab === 'all' ||
  (tab === 'cycle' && isInCycle(payment, cycle)) ||
  (tab === 'renewals' && renewalChangeOf(payment, today) !== null);

/* The payments a tab lists, narrowed by the search and category, in the chosen order */
export const filterPayments = (
  payments: RecurringPayment[],
  {
    tab,
    query,
    category,
    cycle,
    today,
    sort
  }: RecurringFilters & { cycle: PayCycle; today: Date; sort: PaymentSort }
) => {
  const search = query.trim().toLowerCase();
  return sortPayments(
    payments.filter(
      payment =>
        inTab(payment, { tab, cycle, today }) &&
        (category === ALL_CATEGORIES || payment.category === category) &&
        (!search ||
          payment.name.toLowerCase().includes(search) ||
          categoryLabel(payment.category).toLowerCase().includes(search))
    ),
    sort
  );
};

export const tabCounts = (
  payments: RecurringPayment[],
  { cycle, today }: { cycle: PayCycle; today: Date }
): Record<RecurringTab, number> => ({
  all: payments.length,
  cycle: payments.filter(payment => inTab(payment, { tab: 'cycle', cycle, today })).length,
  renewals: payments.filter(payment => inTab(payment, { tab: 'renewals', cycle, today })).length
});

/* The tabs with how many each lists */
export const tabOptions = (counts: Record<RecurringTab, number>) =>
  RECURRING_TABS.map(tab => ({ ...tab, count: counts[tab.value] }));

/* The categories the payments use, A–Z, for the category filter */
export const categoriesUsed = (payments: RecurringPayment[]) =>
  [...new Set(payments.map(payment => payment.category))].sort((a, b) =>
    categoryLabel(a).localeCompare(categoryLabel(b))
  );

/*
 * Totals for a list, the way the dashboard counts them: a monthly figure from weekly to monthly
 * payments, "≈" when some count at their average, quarterly and yearly payments as a yearly
 * figure, and what's still to pay before payday counting every date. Negative is money out. Money
 * moving between two accounts that count isn't spent, so it's left out, though it's counted.
 */
export const listTotals = (
  payments: RecurringPayment[],
  { cycle, today }: { cycle: PayCycle; today: Date }
) => {
  const summary = summarise({
    payments: forFreeToSpend(payments),
    bankBalance: 0,
    monthlyIncome: 0,
    cycle,
    today
  });
  return {
    monthly: -summary.monthlyRecurring,
    annual: summary.annualRecurring,
    averaged: summary.averagedRecurring,
    stillToPay: summary.upcomingNet,
    inCycle: summary.inCycle.length,
    count: activeRecurringCount(payments)
  };
};

/* A total with "+" in front when it brings money in, as the dashboard shows it */
export const signedTotal = (net: number) => (net > 0 ? '+' : '') + formatMoney(net);

/* What the By category tile adds up: a year of everything, or a month without the yearly ones */
export type CategoryPeriod = 'year' | 'month';

export const CATEGORY_PERIODS: { value: CategoryPeriod; label: string }[] = [
  { value: 'year', label: 'Year' },
  { value: 'month', label: 'Month' }
];

export interface CategoryShare {
  category: string;
  label: string;
  // The category's payments over the period: negative for money out, positive for money in
  amount: number;
  // Of all money out, for the bar; null for money in
  share: number | null;
  // Its slice of the bar, and its dot in the legend; null for money in
  colour: string | null;
}

/*
 * Payments by category, over a year or a month. Money out makes the bar, largest first; categories
 * that bring money in follow, kept out of the bar. The total is what's left after both. A month
 * counts weekly and fortnightly payments at their average and leaves quarterly and yearly ones
 * out, as the summary does, giving what they come to a year on its own.
 */
export const categoryBreakdown = (payments: RecurringPayment[], period: CategoryPeriod) => {
  const byCategory = new Map<string, number>();
  let averaged = false;
  let annual = 0;
  for (const payment of payments) {
    // Ended payments no longer cost anything, and money moving between accounts that count isn't
    // spent
    if (!payment.dueDate || movesTo(payment)) continue;
    if (period === 'month' && isYearly(payment.frequency)) {
      annual -= payment.signedAmount * PER_YEAR[payment.frequency];
      continue;
    }
    if (period === 'month' && payment.frequency !== 'MONTHLY') averaged = true;
    const amount =
      payment.signedAmount * (period === 'year' ? PER_YEAR : PER_MONTH)[payment.frequency];
    byCategory.set(payment.category, (byCategory.get(payment.category) ?? 0) + amount);
  }
  const entries = [...byCategory].map(([category, amount]) => ({ category, amount }));
  const out = entries.filter(entry => entry.amount < 0).sort((a, b) => a.amount - b.amount);
  const into = entries.filter(entry => entry.amount > 0).sort((a, b) => b.amount - a.amount);
  const totalOut = out.reduce((total, entry) => total + entry.amount, 0);

  const items: CategoryShare[] = [
    ...out.map((entry, index) => ({
      ...entry,
      share: entry.amount / totalOut,
      colour: sliceColour(index, out.length)
    })),
    ...into.map(entry => ({ ...entry, share: null, colour: null }))
  ].map(entry => ({ ...entry, label: categoryLabel(entry.category) }));

  return {
    items,
    spending: items.filter(item => item.share !== null),
    net: entries.reduce((total, entry) => total + entry.amount, 0),
    // "≈" when weekly or fortnightly payments count at their average a month
    averaged,
    // Quarterly and yearly money out a month leaves out, as a yearly figure
    annual: roundPence(annual)
  };
};

export type CategoryBreakdown = ReturnType<typeof categoryBreakdown>;

/* The accent faded towards the tile for each slice of the bar, so neighbours are told apart */
const sliceColour = (index: number, count: number) => {
  const strength = count > 1 ? 100 - index * (66 / (count - 1)) : 100;
  return `color-mix(in srgb, var(--accent) ${strength.toFixed(1)}%, var(--surface))`;
};

export interface RenewalItem {
  payment: RecurringPayment;
  next: RenewalChange;
}

/* The payments with a renewal or a rate end, and the soonest few in a window that makes sense of them */
export const upcomingRenewals = (payments: RecurringPayment[], { today }: { today: Date }) => {
  const items = payments.flatMap(payment => {
    const next = renewalChangeOf(payment, today);
    return next ? [{ payment, next }] : [];
  });
  return { ...renewalWindow(items), total: items.length };
};
