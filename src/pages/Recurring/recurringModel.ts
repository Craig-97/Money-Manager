import { formatMoney } from '~/lib/format';
import { PayCycle } from '~/lib/payday';
import {
  categoryLabel,
  isInCycle,
  PaymentSort,
  PER_MONTH,
  RecurringPayment,
  Renewal,
  renewalOf,
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

export const recurringOnly = (payments: { kind: string }[]) =>
  payments.filter((payment): payment is RecurringPayment => payment.kind === 'recurring');

/* The payments a tab lists, narrowed by the search and category, in the chosen order */
export const filterPayments = (
  payments: RecurringPayment[],
  { tab, query, category }: RecurringFilters,
  cycle: PayCycle,
  today: Date,
  sort: PaymentSort
) => {
  const search = query.trim().toLowerCase();
  return sortPayments(
    payments.filter(
      payment =>
        (tab === 'all' ||
          (tab === 'cycle' && isInCycle(payment, cycle)) ||
          (tab === 'renewals' && renewalOf(payment, today) !== null)) &&
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
  cycle: PayCycle,
  today: Date
): Record<RecurringTab, number> => ({
  all: payments.length,
  cycle: payments.filter(payment => isInCycle(payment, cycle)).length,
  renewals: payments.filter(payment => renewalOf(payment, today) !== null).length
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
 * figure, and what's still to pay before payday counting every date. Negative is money out.
 */
export const listTotals = (payments: RecurringPayment[], cycle: PayCycle, today: Date) => {
  const summary = summarise({ payments, bankBalance: 0, monthlyIncome: 0, cycle, today });
  return {
    monthly: -summary.monthlyRecurring,
    annual: summary.annualRecurring,
    averaged: summary.averagedRecurring,
    stillToPay: summary.upcomingNet,
    inCycle: summary.inCycle.length,
    count: summary.recurringCount
  };
};

/* A total with "+" in front when it brings money in, as the dashboard shows it */
export const signedTotal = (net: number) => (net > 0 ? '+' : '') + formatMoney(net);

export interface CategoryShare {
  category: string;
  label: string;
  // A year of the category's payments: negative for money out, positive for money in
  yearly: number;
  // Of all money out, for the bar; null for money in
  share: number | null;
  // Its slice of the bar, and its dot in the legend; null for money in
  colour: string | null;
}

/*
 * A year of payments by category. Money out makes the bar, largest first; categories that bring
 * money in follow, kept out of the bar. The total is what's left after both.
 */
export const categoryBreakdown = (payments: RecurringPayment[]) => {
  const byCategory = new Map<string, number>();
  for (const payment of payments) {
    // Ended payments no longer cost anything
    if (!payment.dueDate) continue;
    const yearly = payment.signedAmount * PER_MONTH[payment.frequency] * 12;
    byCategory.set(payment.category, (byCategory.get(payment.category) ?? 0) + yearly);
  }
  const entries = [...byCategory].map(([category, yearly]) => ({ category, yearly }));
  const out = entries.filter(entry => entry.yearly < 0).sort((a, b) => a.yearly - b.yearly);
  const into = entries.filter(entry => entry.yearly > 0).sort((a, b) => b.yearly - a.yearly);
  const totalOut = out.reduce((total, entry) => total + entry.yearly, 0);

  const items: CategoryShare[] = [
    ...out.map((entry, index) => ({
      ...entry,
      share: entry.yearly / totalOut,
      colour: sliceColour(index, out.length)
    })),
    ...into.map(entry => ({ ...entry, share: null, colour: null }))
  ].map(entry => ({ ...entry, label: categoryLabel(entry.category) }));

  return {
    items,
    spending: items.filter(item => item.share !== null),
    net: entries.reduce((total, entry) => total + entry.yearly, 0)
  };
};

export type CategoryBreakdown = ReturnType<typeof categoryBreakdown>;

/* The accent faded towards the tile for each slice of the bar, so neighbours are told apart */
const sliceColour = (index: number, count: number) => {
  const strength = count > 1 ? 100 - index * (66 / (count - 1)) : 100;
  return `color-mix(in srgb, var(--accent) ${strength.toFixed(1)}%, var(--surface))`;
};

/* One page of a list: "1–8 of 11", with which way it can move */
export const pageOf = <T>(items: T[], size: number, page: number) => {
  const pages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, pages - 1);
  const from = current * size;
  const to = Math.min(items.length, from + size);
  return {
    items: items.slice(from, to),
    page: current,
    paged: pages > 1,
    label: `${from + 1}–${to} of ${items.length}`,
    hasPrev: current > 0,
    hasNext: current < pages - 1
  };
};

export interface RenewalItem {
  payment: RecurringPayment;
  renewal: Renewal;
}

/* The payments with a renewal, and the soonest few in a window that makes sense of them */
export const upcomingRenewals = (payments: RecurringPayment[], today: Date, size = 3) => {
  const items = payments.flatMap(payment => {
    const renewal = renewalOf(payment, today);
    return renewal ? [{ payment, renewal }] : [];
  });
  return { ...renewalWindow(items, today, size), total: items.length };
};
