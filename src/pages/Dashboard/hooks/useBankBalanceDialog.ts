import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UpdateAccountBalancesDocument } from '~/graphql/generated';
import { Account } from '~/lib/accounts';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import { showToast } from '~/state/toast';

const roundPence = (amount: number) => Math.round(amount * 100) / 100;

/*
 * The dashboard's bank balance once more than one account counts: each counted account's balance
 * in its own field, saved together. Only the ones changed are sent.
 */
export const useBankBalanceDialog = ({
  budgetId,
  accounts
}: {
  budgetId: string;
  accounts: readonly Account[];
}) => {
  const [open, setOpen] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [saveBalances, { loading: saving }] = useMutation(UpdateAccountBalancesDocument);

  const rows = accounts.map(account => {
    const value = drafts[account.id] ?? formatMoneyInput(account.balance);
    return {
      account,
      value,
      amount: parseMoney(value),
      setValue: (next: string) => setDrafts(current => ({ ...current, [account.id]: next }))
    };
  });
  const valid = rows.every(row => row.amount !== null);

  const save = async () => {
    if (!valid) return;
    const balances = rows
      .filter(row => row.amount !== row.account.balance)
      .map(row => ({ accountId: row.account.id, balance: row.amount as number }));
    try {
      if (balances.length) await saveBalances({ variables: { input: { budgetId, balances } } });
      setOpen(false);
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't save the balances. Try again.") });
    }
  };

  return {
    open,
    start: () => {
      setDrafts({});
      setOpen(true);
    },
    close: () => setOpen(false),
    rows,
    total: roundPence(rows.reduce((sum, row) => sum + (row.amount ?? 0), 0)),
    valid,
    saving,
    save: () => void save()
  };
};

export type BankBalanceDialog = ReturnType<typeof useBankBalanceDialog>;
