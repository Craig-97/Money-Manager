import { useBackToAccount } from '~/hooks/useBackToAccount';
import { Account } from '~/lib/accounts';
import { AmountInput, FieldError, Label } from '../../form';
import { Button, ChangePreview, Modal } from '../../ui';
import { AccountSummary } from '../AccountSummary';
import { useUpdateAccountBalance } from './useUpdateAccountBalance';

interface UpdateAccountBalanceDialogProps {
  accounts: readonly Account[];
  today: Date;
  onUpdate: (account: Account, balance: number) => Promise<boolean>;
}

/*
 * Update balance: what an account has now, from the bank, as a debt's is from a statement. A small
 * dialog on desktop, a sheet on a phone. Edit account has everything else.
 */
export const UpdateAccountBalanceDialog = ({
  accounts,
  today,
  onUpdate
}: UpdateAccountBalanceDialogProps) => {
  const form = useUpdateAccountBalance({ accounts, onUpdate });
  const back = useBackToAccount(form?.account.id);
  if (!form) return null;
  const { account } = form;

  return (
    <Modal
      open={form.open}
      onOpenChange={next => (next ? undefined : form.close())}
      title="Update balance"
      onBack={back}
      backLabel={`Back to ${account.name}`}
      initialFocusId="account-balance-now"
      footer={
        <>
          <span className="flex-1" />
          <Button variant="ghost" onClick={form.close} className="max-md:h-[52px]">
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={form.save}
            disabled={!form.canSave}
            loading={form.saving}
            className="max-md:h-[52px]">
            Save balance
          </Button>
        </>
      }>
      <AccountSummary account={account} today={today} named />
      <div>
        <Label tone="muted" htmlFor="account-balance-now">
          Balance now
        </Label>
        <AmountInput
          id="account-balance-now"
          value={form.draft}
          onChange={event => form.setDraft(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') form.save();
          }}
          placeholder="0.00"
          invalid={!!form.error}
          aria-describedby={form.error ? 'account-balance-now-error' : 'account-balance-now-hint'}
        />
        {form.error ? (
          <FieldError id="account-balance-now-error">{form.error}</FieldError>
        ) : (
          <p
            id="account-balance-now-hint"
            className="mt-2 ml-1 text-xs leading-[1.4] font-semibold text-muted">
            Check your banking app and type what it says.
          </p>
        )}
      </div>
      {form.bankBalance ? (
        <ChangePreview
          label="Bank balance on your dashboard"
          before={form.bankBalance.before}
          after={form.bankBalance.after}
        />
      ) : account.counts ? null : (
        <p className="ml-1 text-xs leading-[1.4] font-semibold text-muted">
          {account.name} is kept out of free to spend, so that doesn’t change.
        </p>
      )}
    </Modal>
  );
};
