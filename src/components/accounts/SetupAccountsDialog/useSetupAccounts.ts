import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useShallow } from 'zustand/react/shallow';
import { AssignPaymentAccountsDocument, UpdateAccountDocument } from '~/graphql/generated';
import { Account, paidIntoAccountOf, spendingOf } from '~/lib/accounts';
import { getApiErrorMessage } from '~/lib/errors';
import { RecurringPayment } from '~/lib/payments';
import { useSetupAccountsStore } from '~/state/setupAccounts';
import { showToast } from '~/state/toast';

interface Options {
  budgetId: string;
  accounts: readonly Account[];
  payments: readonly RecurringPayment[];
}

// Each payment's account as chosen: the one it names while that's still there, else none yet
const fromOf = (payments: readonly RecurringPayment[], accounts: readonly Account[]) =>
  Object.fromEntries(
    payments.map(payment => [
      payment.id,
      accounts.some(account => account.id === payment.account) ? (payment.account ?? '') : ''
    ])
  );

/*
 * "Set up your accounts": which spending account pay lands in, then which one each recurring
 * expense goes out of. Every payment starts where it is now; ones that don't say follow where pay
 * lands, even when that's changed here. Ticking several moves them together. Saving says each one's
 * account, so none are left unchosen.
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
  // Where a payment comes from: its choice, else where pay lands
  const fromId = (id: string) => from[id] || paidInto;

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

  // Where ticked payments move to: the chosen account, else the first that isn't where they all
  // are now, or where pay lands when they're spread out
  const ticked = new Set([...selected].map(fromId));
  const awayFrom = ticked.size === 1 ? [...ticked][0] : paidInto;
  const moveTo =
    spending.find(account => account.id === target) ??
    spending.find(account => account.id !== awayFrom) ??
    null;
  const allSelected = payments.length > 0 && selected.size === payments.length;

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
              accountId: fromId(payment.id) || null
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
    fromOf: (payment: RecurringPayment) => fromId(payment.id),
    setFromOf: (payment: RecurringPayment, accountId: string) =>
      setFrom(current => ({ ...current, [payment.id]: accountId })),
    selected,
    toggle,
    allSelected,
    // Ticks every payment, or clears them all once they are
    toggleAll: () =>
      setSelected(allSelected ? new Set() : new Set(payments.map(payment => payment.id))),
    clearSelection: () => setSelected(new Set()),
    // "7 from Everyday · 2 from Joint bills"
    summary: spending
      .map(
        account =>
          `${payments.filter(payment => fromId(payment.id) === account.id).length} from ${account.name}`
      )
      .join(' · '),
    // Every payment is on where pay lands, as they are before anything's chosen
    allOnPaidInto: payments.every(payment => fromId(payment.id) === paidInto),
    moveTo,
    setTarget,
    moveSelected,
    paidIntoNow,
    saving: assigning || updating,
    save: () => void save()
  };
};

export type SetupAccounts = ReturnType<typeof useSetupAccounts>;
