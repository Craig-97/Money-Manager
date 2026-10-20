import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useShallow } from 'zustand/react/shallow';
import {
  CreateAccountDocument,
  DeleteAccountDocument,
  UpdateAccountDocument
} from '~/graphql/generated';
import { Account, paidIntoAccountOf, spendingOf } from '~/lib/accounts';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoneyInput } from '~/lib/format';
import { useAccountDialogStore } from '~/state/accountDialog';
import { useSetupAccountsStore } from '~/state/setupAccounts';
import { showToast } from '~/state/toast';
import { AccountDraft, checkAccountDraft, EMPTY_ACCOUNT_DRAFT } from '../accountDraft';

const draftOf = (
  account: Account | undefined,
  { paidInto }: { paidInto?: boolean }
): AccountDraft =>
  account
    ? {
        name: account.name,
        kind: account.kind,
        balance: formatMoneyInput(account.balance),
        interestRate: account.interestRate === null ? '' : String(account.interestRate),
        purpose: account.purpose ?? '',
        counts: account.counts,
        paidInto: account.paidInto || !!paidInto
      }
    : EMPTY_ACCOUNT_DRAFT;

/*
 * The account dialog's form: a new account, or one being changed. The balance comes first and is
 * focused, as checking it against the bank is what it's opened for most. Delete asks first. The
 * account pay lands in stays a spending account and can't be deleted; another spending account
 * takes that over with its "Where you get paid" switch.
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
  const openSetup = useSetupAccountsStore(s => s.openSetup);
  const account =
    dialog.view === 'edit' ? accounts.find(item => item.id === dialog.accountId) : undefined;
  const asked = { paidInto: dialog.view === 'edit' && dialog.paidInto };

  const [draft, setDraft] = useState(() => draftOf(account, asked));
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // A new opening: start from its account, or blank (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setDraft(draftOf(account, asked));
    setSubmitted(false);
    setConfirming(dialog.view === 'edit' && !!dialog.confirmDelete);
  }

  const [create, { loading: creating }] = useMutation(CreateAccountDocument);
  const [update, { loading: updating }] = useMutation(UpdateAccountDocument);
  const [remove, { loading: deleting }] = useMutation(DeleteAccountDocument);

  const set = (fields: Partial<AccountDraft>) =>
    setDraft(currentDraft => ({ ...currentDraft, ...fields }));

  const name = draft.name.trim();
  const { errors, fields } = checkAccountDraft(draft, { submitted });

  // Where pay lands stays put until another account takes it over
  const isPaidInto = !!account?.paidInto;
  const spending = draft.kind === 'SPENDING';
  const otherSpending = spendingOf(accounts).filter(item => item.id !== account?.id);
  const paidIntoNow = paidIntoAccountOf(accounts);
  // A spending account, new or not, can take over where pay lands from another one
  const canBePaidInto = spending && !isPaidInto && otherSpending.length > 0;
  // Moving where pay lands: "Your pay goes into Joint bills from your next payday…"
  const paidIntoMove =
    canBePaidInto && draft.paidInto && paidIntoNow
      ? { from: paidIntoNow.name, to: name || account?.name || 'this account' }
      : null;
  // Where pay lands always counts
  const paidIntoInput = canBePaidInto && draft.paidInto ? { paidInto: true, counts: true } : {};

  const failed = (error: unknown, fallback: string) =>
    showToast({ message: getApiErrorMessage(error, fallback) });

  const save = async () => {
    setSubmitted(true);
    if (!fields) return;
    try {
      if (account) {
        await update({
          variables: {
            id: account.id,
            input: {
              ...fields,
              ...(isPaidInto || draft.kind === account.kind ? {} : { kind: draft.kind }),
              ...paidIntoInput
            }
          }
        });
      } else {
        await create({
          variables: { input: { budgetId, kind: draft.kind, ...fields, ...paidIntoInput } }
        });
      }
      close();
      showToast({ message: account ? `${name} saved` : `${name} added` });
      // A second account to spend from: time to say which payments go out of it
      const becameSpending = !account || account.kind !== 'SPENDING';
      if (becameSpending && spending && otherSpending.length === 1) openSetup();
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
    isPaidInto,
    spending,
    // The type can't change on where pay lands: it has to stay an account to spend from
    canChangeKind: !isPaidInto,
    canBePaidInto,
    // Where pay lands, with another account to spend from, shows its switch locked on
    showPaidInto: isPaidInto ? otherSpending.length > 0 : canBePaidInto,
    paidIntoMove,
    // Where pay lands, or about to be, always counts, so there's nothing to switch
    showCounts: !isPaidInto && !paidIntoMove,
    paidIntoName: paidIntoNow?.name ?? null,
    canDelete: !!account && !isPaidInto,
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

export type AccountDialogForm = ReturnType<typeof useAccountDialog>;
