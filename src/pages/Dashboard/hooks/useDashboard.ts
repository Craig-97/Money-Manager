import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UpdateAccountDocument } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
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
import { showToast } from '~/state/toast';
import { PaymentTab, paymentsForTab } from '../dashboardModel';
import { useAlerts } from './useAlerts';
import { useMoneyEditor } from './useMoneyEditor';
import { usePaydayOverride } from './usePaydayOverride';

/* Everything the dashboard shows and does, worked out from the account */
export const useDashboard = (account: Account) => {
  const { today, holidays, cycle } = usePayCycle(account.payday);
  const actions = usePaymentActions(account.id);
  const [updateAccount] = useMutation(UpdateAccountDocument);

  const [tab, setTab] = useState<PaymentTab>('upcoming');
  const [sort, setSort] = useState<PaymentSort>(DEFAULT_SORT);

  const payments = toPayments(account, today);
  const summary = summarise({
    payments,
    bankBalance: account.bankBalance,
    monthlyIncome: account.monthlyIncome,
    cycle,
    today
  });
  const paydayOverride = usePaydayOverride({ account, cycle, today, holidays, payments });
  const alerts = useAlerts({ payments, today, dueToday: summary.dueToday });
  const listed = paymentsForTab(payments, tab, cycle, sort);
  const selection = usePaymentSelection(listed);

  const saveAccount = (fields: { bankBalance?: number; monthlyIncome?: number }) =>
    updateAccount({ variables: { id: account.id, input: fields } }).catch(error =>
      showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") })
    );

  const balanceEditor = useMoneyEditor(account.bankBalance, bankBalance =>
    saveAccount({ bankBalance })
  );
  const incomeEditor = useMoneyEditor(account.monthlyIncome, monthlyIncome =>
    saveAccount({ monthlyIncome })
  );

  return {
    bankBalance: account.bankBalance,
    monthlyIncome: account.monthlyIncome,
    payday: account.payday,
    today,
    cycle,
    payments,
    summary,
    paydayOverride,
    days: cycleDays(cycle, today, payments),
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
