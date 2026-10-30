import { useState } from 'react';
import { Budget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { usePaymentSelection } from '~/hooks/usePaymentSelection';
import { isDebt } from '~/lib/debts';
import { notesByPayment, toNotes } from '~/lib/notes';
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

/* Everything the recurring page shows and does, worked out from the budget */
export const useRecurring = (budget: Budget) => {
  const { today, cycle } = usePayCycle(budget.payday);
  const actions = usePaymentActions(budget.id);

  const [tab, setTab] = useState<RecurringTab>('all');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);
  const [sort, setSort] = useState<PaymentSort>(DEFAULT_SORT);

  const payments = recurringOnly(toPayments(budget, today));
  const paymentNotes = notesByPayment(toNotes(budget.notes));
  const listed = filterPayments(payments, { tab, query, category, cycle, today, sort });
  const selection = usePaymentSelection(listed);

  // Changing what's listed clears the ticks, so nothing out of sight gets acted on
  const narrow =
    <T>(set: (value: T) => void) =>
    (value: T) => {
      set(value);
      selection.clear();
    };

  return {
    // Each payment's notes, for the note chip by its name and its menu
    notesFor: (paymentId: string) => paymentNotes.get(paymentId) ?? [],
    today,
    cycle,
    actions,
    payments,
    // The ones paying off a loan or card, for the Debts card
    debts: payments.filter(isDebt),
    isEmpty: payments.length === 0,
    totals: listTotals(payments, { cycle, today }),
    renewals: upcomingRenewals(payments, { today }),
    breakdown: categoryBreakdown(payments),
    counts: tabCounts(payments, { cycle, today }),
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
    listedTotals: listTotals(listed, { cycle, today }),
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
