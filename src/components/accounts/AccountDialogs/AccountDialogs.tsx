import { useAccountActions } from '~/hooks/useAccountActions';
import { useBudget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { toAccounts } from '~/lib/accounts';
import { AccountDialog } from '../AccountDialog';
import { AccountSheet } from '../AccountSheet';
import { PaidIntoDialog } from '../PaidIntoDialog';
import { SetupAccountsDialog } from '../SetupAccountsDialog';
import { UpdateAccountBalanceDialog } from '../UpdateAccountBalanceDialog';

/*
 * An account's form, its view and its small dialogs, and setting up which account each payment
 * uses, once for the whole app, as a debt's are, so a reminder can open them from any page
 */
export const AccountDialogs = () => {
  const { budget } = useBudget();
  const { today, cycle } = usePayCycle(budget?.payday);
  const actions = useAccountActions(budget);
  const accounts = toAccounts(budget?.accounts, today);

  return (
    <>
      <AccountDialog />
      <AccountSheet />
      <UpdateAccountBalanceDialog
        accounts={accounts}
        today={today}
        onUpdate={actions.updateBalance}
      />
      <PaidIntoDialog
        accounts={accounts}
        today={today}
        cycle={cycle}
        onConfirm={actions.makePaidInto}
      />
      <SetupAccountsDialog />
    </>
  );
};
