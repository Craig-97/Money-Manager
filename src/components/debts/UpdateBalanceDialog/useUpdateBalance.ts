import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { clearedText, DebtPayment, simulatePayoff } from '~/lib/debts';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import { useDebtDialogStore } from '~/state/debtDialog';

interface Options {
  debts: readonly DebtPayment[];
  today: Date;
  onUpdate: (debt: DebtPayment, balance: number) => Promise<boolean>;
}

/*
 * A debt's balance from a statement: what's left now, and when that clears it at its payment,
 * against when it would have. Each opening starts from the balance as it is.
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
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  // A new opening starts from its balance (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setDraft(debt ? formatMoneyInput(debt.debt.balance) : '');
  }

  if (!debt) return null;

  const balance = parseMoney(draft);
  const valid = balance !== null && balance >= 0;
  const changed = valid && balance !== debt.debt.balance;
  const before = clearedText(simulatePayoff([debt]).months, today);
  const after = changed
    ? clearedText(simulatePayoff([{ ...debt, debt: { ...debt.debt, balance } }]).months, today)
    : before;

  const save = async () => {
    if (!changed) return;
    setSaving(true);
    const saved = await onUpdate(debt, balance);
    setSaving(false);
    if (saved) close();
  };

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
    save: () => void save()
  };
};
