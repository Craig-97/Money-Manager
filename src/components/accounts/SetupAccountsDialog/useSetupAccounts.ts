import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useShallow } from 'zustand/react/shallow';
import { AssignPaymentAccountsDocument, UpdateAccountDocument } from '~/graphql/generated';
import { Account, accountOf, paidIntoAccountOf, spendingOf } from '~/lib/accounts';
import { getApiErrorMessage } from '~/lib/errors';
import { RecurringPayment } from '~/lib/payments';
import { useSetupAccountsStore } from '~/state/setupAccounts';
import { showToast } from '~/state/toast';

interface Options {
  budgetId: string;
  accounts: readonly Account[];
  payments: readonly RecurringPayment[];
}

// Each payment's account as it stands: the one it names, else where pay lands
const fromOf = (payments: readonly RecurringPayment[], accounts: readonly Account[]) =>
  Object.fromEntries(payments.map(payment => [payment.id, accountOf(payment, accounts)?.id ?? '']));

/*
 * "Set up your accounts": which spending account pay lands in, then which one each recurring
 * expense goes out of. Every payment starts where it is now (where pay lands, for ones that don't
 * say), and ticking several moves them together. Saving says each one's account, so none are left
 * unchosen.
 */
export const useSetupAccounts = ({ budgetId, accounts, payments }: Options) => {
  const { open, opened, close } = useSetupAccountsStore(
    useShallow(s => ({ open: s.open, opened: s.opened, close: s.close }))
  );
  const spending = spendingOf(accounts);
  const paidIntoNow = paidIntoAccountOf(accounts)?.id ?? '';

  const [paidInto, setPaidInto] = useState(paidIntoNow);
  const [from, setFrom] = useState(() => fromOf(payments, accounts));
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [target, setTarget] = useState('');

  // A new opening starts from the payments as they are (React's "reset state on a prop change"
  // pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setPaidInto(paidIntoNow);
    setFrom(fromOf(payments, accounts));
    setSelected(new Set());
    setTarget('');
  }

  const [assign, { loading: assigning }] = useMutation(AssignPaymentAccountsDocument);
  const [update, { loading: updating }] = useMutation(UpdateAccountDocument);

  // Where ticked payments move to: the chosen account, else the first that isn't where pay lands
  const moveTo =
    spending.find(account => account.id === target) ??
    spending.find(account => account.id !== paidInto) ??
    null;

  const toggle = (id: string) =>
    setSelected(current => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const moveSelected = () => {
    if (!moveTo) return;
    setFrom(current => ({
      ...current,
      ...Object.fromEntries([...selected].map(id => [id, moveTo.id]))
    }));
    setSelected(new Set());
  };

  const save = async () => {
    try {
      if (paidInto && paidInto !== paidIntoNow) {
        await update({ variables: { id: paidInto, input: { paidInto: true } } });
      }
      await assign({
        variables: {
          input: {
            budgetId,
            payments: payments.map(payment => ({
              recurringPaymentId: payment.id,
              accountId: from[payment.id] || null
            }))
          }
        }
      });
      close();
      showToast({ message: 'Accounts set up' });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });
    }
  };

  return {
    open,
    close,
    spending,
    payments,
    paidInto,
    setPaidInto,
    fromOf: (payment: RecurringPayment) => from[payment.id] ?? '',
    setFromOf: (payment: RecurringPayment, accountId: string) =>
      setFrom(current => ({ ...current, [payment.id]: accountId })),
    selected,
    toggle,
    selectAll: () => setSelected(new Set(payments.map(payment => payment.id))),
    clearSelection: () => setSelected(new Set()),
    moveTo,
    setTarget,
    moveSelected,
    saving: assigning || updating,
    save: () => void save()
  };
};

export type SetupAccounts = ReturnType<typeof useSetupAccounts>;
