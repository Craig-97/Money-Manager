import { useMutation } from '@apollo/client/react';
import {
  AccountInterestInput,
  UpdateAccountBalancesDocument,
  UpdateAccountDocument
} from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { Account } from '~/lib/accounts';
import { getApiErrorMessage } from '~/lib/errors';
import { showToast } from '~/state/toast';

const showError = (error: unknown) =>
  showToast({ message: getApiErrorMessage(error, "Couldn't change that. Try again.") });

/*
 * What an account's row, menu and view can do without its full form: count it in or out of free to
 * spend, type in its balance, make it where you get paid, and say when its interest is paid
 */
export const useAccountActions = (budget: Budget | null | undefined) => {
  const [updateAccount] = useMutation(UpdateAccountDocument);
  const [updateBalances] = useMutation(UpdateAccountBalancesDocument);

  const setCounts = async (account: Account, counts: boolean) => {
    const stored = budget?.accounts.find(item => item.id === account.id);
    if (!budget || !stored) return;
    try {
      await updateAccount({
        variables: { id: account.id, input: { counts } },
        optimisticResponse: {
          updateAccount: {
            __typename: 'AccountResponse',
            // As the budget has it, with the switch changed
            account: { ...stored, counts },
            budget: {
              __typename: 'Budget',
              id: budget.id,
              bankBalance: budget.bankBalance + (counts ? account.balance : -account.balance),
              accounts: budget.accounts.map(item =>
                item.id === account.id ? { ...item, counts } : item
              ),
              recurringPayments: budget.recurringPayments ?? [],
              oneOffPayments: budget.oneOffPayments ?? []
            }
          }
        }
      });
      showToast({
        message: counts
          ? `${account.name} now counts in free to spend`
          : `${account.name} is kept out of free to spend`
      });
    } catch (error) {
      showError(error);
    }
  };

  // A balance typed in from the bank, dated now. Resolves to whether it saved.
  const updateBalance = async (account: Account, balance: number) => {
    if (!budget) return false;
    try {
      await updateBalances({
        variables: {
          input: { budgetId: budget.id, balances: [{ accountId: account.id, balance }] }
        }
      });
      showToast({ message: `${account.name} updated` });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  // Pay lands here from now on; where it landed stops being where you get paid
  const makePaidInto = async (account: Account) => {
    try {
      await updateAccount({
        variables: { id: account.id, input: { paidInto: true, counts: true } }
      });
      showToast({ message: `Your pay goes into ${account.name} now` });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  // Its rate and when it's paid; null for none. Resolves to whether it saved.
  const saveInterest = async (account: Account, interest: AccountInterestInput | null) => {
    try {
      await updateAccount({ variables: { id: account.id, input: { interest } } });
      showToast({ message: `${account.name} saved` });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  return {
    setCounts: (account: Account, counts: boolean) => void setCounts(account, counts),
    updateBalance,
    makePaidInto,
    saveInterest
  };
};
