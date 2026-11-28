import { useState } from 'react';
import {
  AccountChooser,
  accountDialogTitle,
  AccountDraft,
  AccountFields,
  blankDraft,
  checkAccountDraft,
  EMPTY_ACCOUNT_DRAFT
} from '~/components/accounts';
import { Modal, ModalActions } from '~/components/ui';
import { startOfToday } from '~/lib/dates';
import { SetupState } from '../../../hooks';

/*
 * Adding another account during setup, or changing one: the same chooser and fields as the
 * Accounts page, kept until setup finishes. A dialog on desktop, a sheet on mobile.
 */
export const SetupAccountDialog = ({ setup }: { setup: SetupState }) => {
  const { account: dialog, values } = setup;
  const editing = values.accounts.find(account => account.key === dialog.key);
  const [draft, setDraft] = useState<AccountDraft>(editing?.draft ?? EMPTY_ACCOUNT_DRAFT);
  // Adding starts with what kind of account it is
  const [choosing, setChoosing] = useState(!editing);
  const [submitted, setSubmitted] = useState(false);

  // Each opening starts from its account, or blank (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(dialog.opened);
  if (dialog.opened !== currentOpening) {
    setCurrentOpening(dialog.opened);
    setDraft(editing?.draft ?? EMPTY_ACCOUNT_DRAFT);
    setChoosing(!editing);
    setSubmitted(false);
  }

  const today = startOfToday();
  const { errors, fields } = checkAccountDraft(draft, { submitted, today });
  const save = () => {
    setSubmitted(true);
    if (fields) dialog.save(draft);
  };

  return (
    <Modal
      open={dialog.open}
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={accountDialogTitle(draft.kind, { editing: editing?.draft.name, choosing })}
      onBack={!editing && !choosing ? () => setChoosing(true) : undefined}
      backLabel="Back to account types"
      initialFocusId={choosing ? undefined : 'account-balance'}
      footer={
        choosing ? undefined : (
          <ModalActions
            remove={
              editing ? { label: 'Remove', onClick: () => dialog.remove(editing.key) } : undefined
            }
            cancel={{ onClick: dialog.close }}
            confirm={{ label: editing ? 'Save' : 'Add account', onClick: save }}
          />
        )
      }>
      {choosing ? (
        <AccountChooser
          onChoose={kind => {
            setDraft(blankDraft(kind));
            setSubmitted(false);
            setChoosing(false);
          }}
        />
      ) : (
        <AccountFields
          key={dialog.opened}
          draft={draft}
          today={today}
          set={changes => setDraft(current => ({ ...current, ...changes }))}
          errors={errors}
          canChangeKind={!!editing}
          editing={!!editing}
        />
      )}
    </Modal>
  );
};
