import { useShallow } from 'zustand/react/shallow';
import { Account } from '~/lib/accounts';
import { formatBalance, roundPence } from '~/lib/format';
import { useAccountQuickStore } from '~/state/accountQuick';
import { useBalanceDraft } from '../../form';

interface Options {
  accounts: readonly Account[];
  onUpdate: (account: Account, balance: number) => Promise<boolean>;
}

/*
 * An account's balance from the bank: what it is now, and what that does to the bank balance on the
 * dashboard when it counts there. It can be below £0, and typing the same balance still dates it.
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
  const {
    draft,
    setDraft,
    typed: balance,
    saving,
    save
  } = useBalanceDraft({
    opened,
    balance: account?.balance,
    close
  });

  if (!account) return null;

  const changed = balance !== null && balance !== account.balance;
  const counted = roundPence(
    accounts.filter(item => item.counts).reduce((sum, item) => sum + item.balance, 0)
  );

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
    canSave: balance !== null && !saving,
    saving,
    close,
    save: () => {
      if (balance !== null) void save(() => onUpdate(account, balance));
    }
  };
};
