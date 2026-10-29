import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UpdateAccountDocument, UpdateBudgetDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { usePaymentSelection } from '~/hooks/usePaymentSelection';
import { forFreeToSpend, paidIntoAccountOf, toAccounts } from '~/lib/accounts';
import { getApiErrorMessage } from '~/lib/errors';
import { notesByPayment, toNotes } from '~/lib/notes';
import {
  canPay,
  cycleDays,
  DEFAULT_SORT,
  PaymentSort,
  summarise,
  toPayments
} from '~/lib/payments';
import { toReminderStates } from '~/lib/reminders';
import { showToast } from '~/state/toast';
import { PaymentTab, paymentsForTab } from '../dashboardModel';
import { useAlerts } from './useAlerts';
import { useBankBalanceDialog } from './useBankBalanceDialog';
import { useMoneyEditor } from './useMoneyEditor';
import { usePaydayOverride } from './usePaydayOverride';

/* Everything the dashboard shows and does, worked out from the budget */
export const useDashboard = (budget: Budget) => {
  const { today, holidays, cycle } = usePayCycle(budget.payday);
  const actions = usePaymentActions(budget.id);
  const [updateBudget] = useMutation(UpdateBudgetDocument);
  const [updateAccount] = useMutation(UpdateAccountDocument);

  const [tab, setTab] = useState<PaymentTab>('upcoming');
  const [sort, setSort] = useState<PaymentSort>(DEFAULT_SORT);

  const payments = toPayments(budget, today);
  const paymentNotes = notesByPayment(toNotes(budget.notes));
  const accounts = toAccounts(budget.accounts, today);
  const counted = accounts.filter(account => account.counts);
  const current = paidIntoAccountOf(accounts);
  const summary = summarise({
    payments: forFreeToSpend(payments, accounts),
    bankBalance: budget.bankBalance,
    monthlyIncome: budget.monthlyIncome,
    cycle,
    today
  });
  const paydayOverride = usePaydayOverride({ budget, cycle, today, holidays, payments });
  const alerts = useAlerts({
    budgetId: budget.id,
    payments,
    today,
    dueToday: summary.dueToday,
    states: toReminderStates(budget.reminderStates)
  });
  const listed = paymentsForTab(payments, { tab, cycle, sort });
  const selection = usePaymentSelection(listed);

  const failed = (error: unknown) =>
    showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });

  // With only the account pay lands in counting, the bank balance is its balance, edited in place.
  // Once more count, the pencil opens each one's balance instead.
  const bankBalanceDialog = useBankBalanceDialog({ budgetId: budget.id, accounts: counted });
  const inPlace = useMoneyEditor(budget.bankBalance, balance =>
    current
      ? updateAccount({ variables: { id: current.id, input: { balance } } }).catch(failed)
      : Promise.resolve()
  );
  const balanceEditor =
    counted.length > 1 ? { ...inPlace, editing: false, start: bankBalanceDialog.start } : inPlace;
  const incomeEditor = useMoneyEditor(budget.monthlyIncome, monthlyIncome =>
    updateBudget({ variables: { id: budget.id, input: { monthlyIncome } } }).catch(failed)
  );

  return {
    // Each payment's notes, for the note chip by its name and its menu
    notesFor: (paymentId: string) => paymentNotes.get(paymentId) ?? [],
    bankBalance: budget.bankBalance,
    monthlyIncome: budget.monthlyIncome,
    payday: budget.payday,
    today,
    cycle,
    payments,
    summary,
    paydayOverride,
    days: cycleDays(cycle, { today, payments }),
    isEmpty: payments.length === 0,
    actions,
    balanceEditor,
    bankBalanceDialog,
    // How many accounts make up the bank balance, when it's more than one
    countedAccounts: counted.length,
    incomeEditor,
    alerts,
    tab,
    setTab: (next: PaymentTab) => {
      setTab(next);
      selection.clear();
    },
    sort,
    setSort,
    listed,
    // Upcoming counts every date before payday, though it lists each payment once. Recurring is a
    // monthly figure, with quarterly and yearly payments kept apart as the summary has them.
    listedNet:
      tab === 'upcoming'
        ? summary.upcomingNet
        : tab === 'recurring'
          ? -summary.monthlyRecurring
          : listed.reduce((total, payment) => total + payment.signedAmount, 0),
    selection,
    // Recurring payments with nothing left this cycle are left out, so they aren't paid ahead
    paySelected: () =>
      actions.pay(selection.selectedPayments.filter(payment => canPay(payment, cycle)))
  };
};

export type Dashboard = ReturnType<typeof useDashboard>;
