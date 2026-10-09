import { useState } from 'react';
import { Account } from '~/hooks/useAccount';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { usePaymentSelection } from '~/hooks/usePaymentSelection';
import { canPay, DEFAULT_SORT, PaymentSort, toPayments } from '~/lib/payments';
import {
  ALL_CATEGORIES,
  categoriesUsed,
  categoryBreakdown,
  filterPayments,
  listTotals,
  RecurringTab,
  recurringOnly,
  tabCounts,
  upcomingRenewals
} from '../../recurringModel';

// The payments table's heading, which "View all renewals" scrolls to
export const PAYMENTS_HEADING_ID = 'recurring-payments-title';

/* Everything the recurring page shows and does, worked out from the account */
export const useRecurring = (account: Account) => {
  const { today, cycle } = usePayCycle(account.payday);
  const actions = usePaymentActions(account.id);

  const [tab, setTab] = useState<RecurringTab>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [sort, setSort] = useState<PaymentSort>(DEFAULT_SORT);

  const payments = recurringOnly(toPayments(account, today));
  const listed = filterPayments(payments, { tab, query, category }, cycle, today, sort);
  const selection = usePaymentSelection(listed);

  // Changing what's listed clears the ticks, so nothing out of sight gets acted on
  const narrow =
    <T>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      selection.clear();
    };

  return {
    today,
    cycle,
    actions,
    payments,
    isEmpty: payments.length === 0,
    totals: listTotals(payments, cycle, today),
    renewals: upcomingRenewals(payments, today),
    breakdown: categoryBreakdown(payments),
    counts: tabCounts(payments, cycle, today),
    categories: categoriesUsed(payments),
    tab,
    setTab: narrow(setTab),
    query,
    setQuery: narrow(setQuery),
    category,
    setCategory: narrow(setCategory),
    sort,
    setSort,
    listed,
    listedTotals: listTotals(listed, cycle, today),
    selection,
    // Payments with nothing left this cycle are left out, so they aren't paid ahead
    paySelected: () =>
      actions.pay(selection.selectedPayments.filter(payment => canPay(payment, cycle))),
    // "View all renewals": the table's Renewals tab with nothing else narrowing it
    showRenewals: () => {
      setTab('renewals');
      setQuery('');
      setCategory(ALL_CATEGORIES);
      selection.clear();
      document
        .getElementById(PAYMENTS_HEADING_ID)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
};

export type Recurring = ReturnType<typeof useRecurring>;
