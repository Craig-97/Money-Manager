import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { Button } from '~/components/ui/Button';
import { Modal } from '~/components/ui/Modal';
import { AccountInterestInput } from '~/graphql/generated';
import { useBackToAccount } from '~/hooks/useBackToAccount';
import { Account } from '~/lib/accounts';
import { useAccountQuickStore } from '~/state/accountQuick';
import { checkInterestDraft, InterestDraft, interestDraftOf } from '../accountDraft';
import { AccountSummary } from '../AccountSummary';
import { InterestFields } from '../InterestFields';

interface InterestDialogProps {
  accounts: readonly Account[];
  today: Date;
  onSave: (account: Account, interest: AccountInterestInput | null) => Promise<boolean>;
}

/*
 * Interest: a savings account's rate and when it's paid, on its own, as Update balance is for its
 * balance. Edit account has the same fields with everything else.
 */
export const InterestDialog = ({ accounts, today, onSave }: InterestDialogProps) => {
  const { open, accountId, opened, close } = useAccountQuickStore(
    useShallow(s => ({
      open: s.open === 'interest',
      accountId: s.accountId,
      opened: s.opened,
      close: s.close
    }))
  );
  const account = accounts.find(item => item.id === accountId);
  const back = useBackToAccount(account?.id);
  const [draft, setDraft] = useState<InterestDraft>(() =>
    interestDraftOf(account?.interest ?? null)
  );
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  // A new opening starts from its interest (React's "reset state on a prop change" pattern)
  const [currentOpening, setCurrentOpening] = useState(opened);
  if (opened !== currentOpening) {
    setCurrentOpening(opened);
    setDraft(interestDraftOf(account?.interest ?? null));
    setSubmitted(false);
  }

  if (!account) return null;
  const check = checkInterestDraft(draft, { today, before: interestDraftOf(account.interest) });

  const save = async () => {
    setSubmitted(true);
    if (!check.valid) return;
    if (check.unchanged) {
      close();
      return;
    }
    setSaving(true);
    const saved = await onSave(account, check.input);
    setSaving(false);
    if (saved) close();
  };

  return (
    <Modal
      open={open}
      onOpenChange={next => (next ? undefined : close())}
      title="Interest"
      onBack={back}
      backLabel={`Back to ${account.name}`}
      initialFocusId="account-rate"
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={close} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={() => void save()}
            loading={saving}
            className="max-md:h-[52px]">
            Save interest
          </Button>
        </>
      }>
      <AccountSummary account={account} today={today} named />
      <InterestFields
        draft={draft}
        set={fields => setDraft(current => ({ ...current, ...fields }))}
        errors={submitted ? check.errors : {}}
        balance={account.balance}
        today={today}
      />
    </Modal>
  );
};
