import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UpdateBudgetDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { usePaymentSelection } from '~/hooks/usePaymentSelection';
import { getApiErrorMessage } from '~/lib/errors';
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
import { useMoneyEditor } from './useMoneyEditor';
import { usePaydayOverride } from './usePaydayOverride';

/* Everything the dashboard shows and does, worked out from the budget */
export const useDashboard = (budget: Budget) => {
  const { today, holidays, cycle } = usePayCycle(budget.payday);
  const actions = usePaymentActions(budget.id);
  const [updateBudget] = useMutation(UpdateBudgetDocument);

  const [tab, setTab] = useState<PaymentTab>('upcoming');
  const [sort, setSort] = useState<PaymentSort>(DEFAULT_SORT);

  const payments = toPayments(budget, today);
  const summary = summarise({
    payments,
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

  const saveBudget = (fields: { bankBalance?: number; monthlyIncome?: number }) =>
    updateBudget({ variables: { id: budget.id, input: fields } }).catch(error =>
      showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") })
    );

  const balanceEditor = useMoneyEditor(budget.bankBalance, bankBalance =>
    saveBudget({ bankBalance })
  );
  const incomeEditor = useMoneyEditor(budget.monthlyIncome, monthlyIncome =>
    saveBudget({ monthlyIncome })
  );

  return {
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
