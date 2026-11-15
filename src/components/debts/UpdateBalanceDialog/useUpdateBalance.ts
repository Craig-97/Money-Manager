import { useShallow } from 'zustand/react/shallow';
import { clearedText, DebtPayment, simulatePayoff } from '~/lib/debts';
import { useDebtDialogStore } from '~/state/debtDialog';
import { useBalanceDraft } from '../../form';

interface Options {
  debts: readonly DebtPayment[];
  today: Date;
  onUpdate: (debt: DebtPayment, balance: number) => Promise<boolean>;
}

/*
 * A debt's balance from a statement: what's left now, £0 or more, and when that clears it at its
 * payment, against when it would have
 */
export const useUpdateBalance = ({ debts, today, onUpdate }: Options) => {
  const { open, debtId, opened, close } = useDebtDialogStore(
    useShallow(s => ({
      open: s.open === 'balance',
      debtId: s.balanceDebtId,
      opened: s.opened,
      close: s.close
    }))
  );
  const debt = debts.find(item => item.id === debtId);
  const {
    draft,
    setDraft,
    typed: balance,
    saving,
    save
  } = useBalanceDraft({
    opened,
    balance: debt?.debt.balance,
    close
  });

  if (!debt) return null;

  const valid = balance !== null && balance >= 0;
  const changed = valid && balance !== debt.debt.balance;
  const before = clearedText(simulatePayoff([debt]).months, today);
  const after = changed
    ? clearedText(simulatePayoff([{ ...debt, debt: { ...debt.debt, balance } }]).months, today)
    : before;

  return {
    open: open && !!debt,
    debt,
    draft,
    setDraft,
    error: draft && !valid ? 'Enter what’s left, £0 or more' : undefined,
    // When it clears before and after, once the new balance moves it
    cleared: after !== before ? { before, after: balance === 0 ? 'Cleared now' : after } : null,
    canSave: changed && !saving,
    saving,
    close,
    save: () => {
      if (changed) void save(() => onUpdate(debt, balance));
    }
  };
};
