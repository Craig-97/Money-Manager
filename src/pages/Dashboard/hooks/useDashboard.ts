import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { EditAccountDocument } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { usePayCycle } from '~/hooks/usePayCycle';
import { usePaymentActions } from '~/hooks/usePaymentActions';
import { getApiErrorMessage } from '~/lib/errors';
import { cycleDays, summarise, toPayments } from '~/lib/payments';
import { showToast } from '~/state/toast';
import { PaymentTab, paymentsForTab } from '../dashboardModel';
import { useMoneyEditor } from './useMoneyEditor';
import { usePaydayOverride } from './usePaydayOverride';

/* Everything the dashboard shows and does, worked out from the account */
export const useDashboard = (account: Account) => {
  const { today, holidays, cycle } = usePayCycle(account.payday);
  const actions = usePaymentActions(account.id);
  const [editAccount] = useMutation(EditAccountDocument);

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
    editAccount({ variables: { id: account.id, account: fields } }).catch(error =>
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
    selected,
    selectedPayments,
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
