import { useBackToAccount } from '~/hooks/useBackToAccount';
import { Account } from '~/lib/accounts';
import { BalanceDialog, FieldHint } from '../../form';
import { ChangePreview } from '../../ui';
import { AccountSummary } from '../AccountSummary';
import { useUpdateAccountBalance } from './useUpdateAccountBalance';

interface UpdateAccountBalanceDialogProps {
  accounts: readonly Account[];
  today: Date;
  onUpdate: (account: Account, balance: number) => Promise<boolean>;
}

/* Update balance for an account: what it has now, from the bank */
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
    <BalanceDialog
      form={form}
      id="account-balance-now"
      summary={<AccountSummary account={account} today={today} named />}
      hint="Check your banking app and type what it says."
      onBack={back}
      backLabel={`Back to ${account.name}`}>
      {form.bankBalance ? (
        <ChangePreview
          label="Bank balance on your dashboard"
          before={form.bankBalance.before}
          after={form.bankBalance.after}
        />
      ) : account.counts ? null : (
        <FieldHint className="mt-0">
          {account.name} is kept out of free to spend, so that doesn’t change.
        </FieldHint>
      )}
    </BalanceDialog>
  );
};
