import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UpdateAccountDocument } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { getApiErrorMessage } from '~/lib/errors';
import { canPay, cycleDays, summarise, toPayments } from '~/lib/payments';
import { showToast } from '~/state/toast';
import { PaymentTab, paymentsForTab } from '../dashboardModel';
import { useMoneyEditor } from './useMoneyEditor';
import { usePaydayOverride } from './usePaydayOverride';

/* Everything the dashboard shows and does, worked out from the account */
export const useDashboard = (account: Account) => {
  const { today, holidays, cycle } = usePayCycle(account.payday);
  const actions = usePaymentActions(account.id);
  const [updateAccount] = useMutation(UpdateAccountDocument);

  const [tab, setTab] = useState<PaymentTab>('upcoming');
  const [ascending, setAscending] = useState(true);
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set());
  // Mobile: rows tick on tap instead of opening, with bulk actions in place of the nav
  const [selecting, setSelecting] = useState(false);
  // "Later" on the due today banner hides it for this visit
  const [dueDismissed, setDueDismissed] = useState(false);

  const payments = toPayments(account, today);
  const summary = summarise({
    payments,
    bankBalance: account.bankBalance,
    monthlyIncome: account.monthlyIncome,
    cycle,
    today
  });
  const paydayOverride = usePaydayOverride({ account, cycle, today, holidays, payments });
  const listed = paymentsForTab(payments, tab, cycle, today, ascending);
  const selectedPayments = listed.filter(payment => selected.has(payment.id));

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
    dueToday: dueDismissed ? undefined : summary.dueToday,
    dismissDue: () => setDueDismissed(true),
    tab,
    setTab: (next: PaymentTab) => {
      setTab(next);
      setSelected(new Set());
    },
    ascending,
    toggleSort: () => setAscending(current => !current),
    listed,
    // Upcoming counts every date before payday, though it lists each payment once. Recurring is a
    // monthly figure, with quarterly and yearly payments kept apart as the summary has them.
    listedNet:
      tab === 'upcoming'
        ? summary.upcomingNet
        : tab === 'recurring'
          ? -summary.monthlyRecurring
          : listed.reduce((total, payment) => total + payment.signedAmount, 0),
    selected,
    selectedPayments,
    // Recurring payments with nothing left this cycle are left out, so they aren't paid ahead
    paySelected: () => actions.pay(selectedPayments.filter(payment => canPay(payment, cycle))),
    toggleSelected: (id: string) =>
      setSelected(current => {
        const next = new Set(current);
        if (!next.delete(id)) next.add(id);
        return next;
      }),
    selectAll: (all: boolean) =>
      setSelected(all ? new Set(listed.map(payment => payment.id)) : new Set()),
    clearSelection: () => setSelected(new Set()),
    selecting,
    toggleSelecting: () => {
      setSelecting(current => !current);
      setSelected(new Set());
    },
    stopSelecting: () => {
      setSelecting(false);
      setSelected(new Set());
    }
  };
};

export type Dashboard = ReturnType<typeof useDashboard>;
