import { useState } from 'react';
import { Trash } from 'lucide-react';
import {
  AccountDraft,
  AccountFields,
  checkAccountDraft,
  EMPTY_ACCOUNT_DRAFT
} from '~/components/accounts';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { SetupState } from '../../../hooks';

/*
 * Adding another account during setup, or changing one: the same fields as the Accounts page, kept
 * until setup finishes. A dialog on desktop, a sheet on mobile.
 */
export const SetupAccountDialog = ({ setup }: { setup: SetupState }) => {
  const { account: dialog, values } = setup;
  const editing = values.accounts.find(account => account.key === dialog.key);
  const [draft, setDraft] = useState<AccountDraft>(editing?.draft ?? EMPTY_ACCOUNT_DRAFT);
  const [submitted, setSubmitted] = useState(false);

  // Each opening starts from its account, or blank (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(dialog.opened);
  if (dialog.opened !== currentOpening) {
    setCurrentOpening(dialog.opened);
    setDraft(editing?.draft ?? EMPTY_ACCOUNT_DRAFT);
    setSubmitted(false);
  }

  const { errors, fields } = checkAccountDraft(draft, { submitted });
  const save = () => {
    setSubmitted(true);
    if (fields) dialog.save(draft);
  };

  return (
    <Modal
      open={dialog.open}
      onOpenChange={next => (next ? undefined : dialog.close())}
      title={editing ? `Edit ${editing.draft.name}` : 'Add account'}
      initialFocusId="account-balance"
      footer={
        <>
          {editing ? (
            <Button
              variant="dangerGhost"
              onClick={() => dialog.remove(editing.key)}
              className="max-md:-ml-2">
              <Trash size={16} aria-hidden="true" />
              Remove
            </Button>
          ) : null}
          <span className="flex-1" />
          <Button variant="ghost" onClick={dialog.close} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button variant="accent" onClick={save} className="max-md:h-[52px]">
            {editing ? 'Save' : 'Add account'}
          </Button>
        </>
      }>
      <AccountFields
        draft={draft}
        set={changes => setDraft(current => ({ ...current, ...changes }))}
        errors={errors}
        canChangeKind
      />
    </Modal>
  );
};
