import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Account } from '~/lib/accounts';
import { formatBalance, formatMoneyInput, parseMoney, roundPence } from '~/lib/format';
import { useAccountQuickStore } from '~/state/accountQuick';

interface Options {
  accounts: readonly Account[];
  onUpdate: (account: Account, balance: number) => Promise<boolean>;
}

/*
 * An account's balance from the bank: what it is now, and what that does to the bank balance on the
 * dashboard when it counts there. Each opening starts from the balance as it is.
 */
export const useUpdateAccountBalance = ({ accounts, onUpdate }: Options) => {
  const { open, accountId, opened, close } = useAccountQuickStore(
    useShallow(s => ({
      open: s.open === 'balance',
      accountId: s.accountId,
      opened: s.opened,
      close: s.close
    }))
  );
  const account = accounts.find(item => item.id === accountId);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  // A new opening starts from its balance (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setDraft(account ? formatMoneyInput(account.balance) : '');
  }

  if (!account) return null;

  const balance = parseMoney(draft);
  const changed = balance !== null && balance !== account.balance;
  const counted = roundPence(
    accounts.filter(item => item.counts).reduce((sum, item) => sum + item.balance, 0)
  );

  const save = async () => {
    if (balance === null) return;
    setSaving(true);
    const saved = await onUpdate(account, balance);
    setSaving(false);
    if (saved) close();
  };

  return {
    open: open && !!account,
    account,
    draft,
    setDraft,
    error: draft && balance === null ? 'Enter the balance, like 1,250.00' : undefined,
    // The dashboard's bank balance before and after, once the new balance moves it
    bankBalance:
      account.counts && changed
        ? {
            before: formatBalance(counted),
            after: formatBalance(roundPence(counted - account.balance + balance))
          }
        : null,
    // Typing in the same balance still dates it today
    canSave: balance !== null && !saving,
    saving,
    close,
    save: () => void save()
  };
};
