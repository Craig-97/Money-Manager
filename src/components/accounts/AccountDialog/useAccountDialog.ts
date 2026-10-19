import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useShallow } from 'zustand/react/shallow';
import {
  CreateAccountDocument,
  DeleteAccountDocument,
  UpdateAccountDocument
} from '~/graphql/generated';
import { Account, isCurrent } from '~/lib/accounts';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import { useAccountDialogStore } from '~/state/accountDialog';
import { showToast } from '~/state/toast';

const NAME_MAX = 50;
const PURPOSE_MAX = 60;

interface Draft {
  name: string;
  balance: string;
  interestRate: string;
  purpose: string;
  counts: boolean;
}

const EMPTY: Draft = { name: '', balance: '', interestRate: '', purpose: '', counts: false };

const draftOf = (account: Account | undefined): Draft =>
  account
    ? {
        name: account.name,
        balance: formatMoneyInput(account.balance),
        interestRate: account.interestRate === null ? '' : String(account.interestRate),
        purpose: account.purpose ?? '',
        counts: account.counts
      }
    : EMPTY;

/* A rate as typed: blank for none, otherwise a percentage from 0 to 100 */
const parseRate = (value: string) => {
  const cleaned = value.replace(/[%\s]/g, '');
  if (!cleaned) return { rate: null, valid: true };
  const rate = Number(cleaned);
  return { rate, valid: Number.isFinite(rate) && rate >= 0 && rate <= 100 };
};

/*
 * The account dialog's form: a new savings account, or one being changed. The balance comes first
 * and is focused, as checking it against the bank is what it's opened for most. Delete asks first.
 */
export const useAccountDialog = ({
  budgetId,
  accounts
}: {
  budgetId: string;
  accounts: readonly Account[];
}) => {
  const { dialog, open, opened, close } = useAccountDialogStore(
    useShallow(s => ({ dialog: s.dialog, open: s.open, opened: s.opened, close: s.close }))
  );
  const account =
    dialog.view === 'edit' ? accounts.find(item => item.id === dialog.accountId) : undefined;

  const [draft, setDraft] = useState(() => draftOf(account));
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // A new opening: start from its account, or blank (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setDraft(draftOf(account));
    setSubmitted(false);
    setConfirming(dialog.view === 'edit' && !!dialog.confirmDelete);
  }

  const [create, { loading: creating }] = useMutation(CreateAccountDocument);
  const [update, { loading: updating }] = useMutation(UpdateAccountDocument);
  const [remove, { loading: deleting }] = useMutation(DeleteAccountDocument);

  const set = (fields: Partial<Draft>) =>
    setDraft(currentDraft => ({ ...currentDraft, ...fields }));

  const name = draft.name.trim();
  const balance = parseMoney(draft.balance);
  const { rate, valid: rateValid } = parseRate(draft.interestRate);
  const errors = {
    balance: submitted && balance === null ? 'Enter the balance, like 1,250.00' : undefined,
    name: !submitted
      ? undefined
      : !name
        ? 'Give it a name'
        : name.length > NAME_MAX
          ? `Keep it to ${NAME_MAX} characters`
          : undefined,
    interestRate: submitted && !rateValid ? 'Enter a rate from 0 to 100, like 4.5' : undefined,
    purpose:
      submitted && draft.purpose.trim().length > PURPOSE_MAX
        ? `Keep it to ${PURPOSE_MAX} characters`
        : undefined
  };
  const isCurrentAccount = account ? isCurrent(account) : false;

  const failed = (error: unknown, fallback: string) =>
    showToast({ message: getApiErrorMessage(error, fallback) });

  const save = async () => {
    setSubmitted(true);
    if (balance === null || !name || name.length > NAME_MAX || !rateValid) return;
    if (draft.purpose.trim().length > PURPOSE_MAX) return;
    // The current account always counts, and has no rate or purpose to set
    const fields = isCurrentAccount
      ? { name, balance }
      : {
          name,
          balance,
          counts: draft.counts,
          interestRate: rate,
          purpose: draft.purpose.trim() || null
        };
    try {
      if (account) await update({ variables: { id: account.id, input: fields } });
      else await create({ variables: { input: { budgetId, ...fields } } });
      close();
      showToast({ message: account ? `${name} saved` : `${name} added` });
    } catch (error) {
      failed(error, "Couldn't save the account. Try again.");
    }
  };

  const confirmDelete = async () => {
    if (!account) return;
    try {
      await remove({ variables: { id: account.id } });
      close();
      showToast({ message: `${account.name} deleted` });
    } catch (error) {
      failed(error, "Couldn't delete the account. Try again.");
    }
  };

  return {
    open,
    close,
    account,
    isCurrent: isCurrentAccount,
    draft,
    set,
    errors,
    saving: creating || updating,
    deleting,
    save: () => void save(),
    confirming,
    askDelete: () => setConfirming(true),
    keep: () => setConfirming(false),
    confirmDelete: () => void confirmDelete()
  };
};
