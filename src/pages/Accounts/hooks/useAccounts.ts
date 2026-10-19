import { useMutation } from '@apollo/client/react';
import { UpdateAccountDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import {
  Account,
  accountTotals,
  currentAccountOf,
  isStale,
  savingsOf,
  toAccounts
} from '~/lib/accounts';
import { debtTotals, isDebt } from '~/lib/debts';
import { getApiErrorMessage } from '~/lib/errors';
import { RecurringPayment, toPayments } from '~/lib/payments';
import { showToast } from '~/state/toast';

/* Everything the Accounts page shows and does, worked out from the budget */
export const useAccounts = (budget: Budget) => {
  const { today } = usePayCycle(budget.payday);
  const [updateAccount] = useMutation(UpdateAccountDocument);

  const accounts = toAccounts(budget.accounts, today);
  const debts = toPayments(budget, today)
    .filter((payment): payment is RecurringPayment => payment.kind === 'recurring')
    .filter(isDebt)
    .filter(debt => debt.debt.balance > 0);
  const totals = accountTotals(accounts, { owed: debtTotals(debts).left });

  // Switching an account in or out of free to spend, straight from its row
  const setCounts = async (account: Account, counts: boolean) => {
    try {
      await updateAccount({
        variables: { id: account.id, input: { counts } },
        optimisticResponse: {
          updateAccount: {
            __typename: 'AccountResponse',
            account: {
              __typename: 'Account',
              id: account.id,
              name: account.name,
              kind: account.kind,
              balance: account.balance,
              counts,
              interestRate: account.interestRate,
              purpose: account.purpose,
              balanceUpdatedAt: String(account.balanceUpdatedAt.getTime())
            },
            budget: {
              __typename: 'Budget',
              id: budget.id,
              bankBalance: budget.bankBalance + (counts ? account.balance : -account.balance)
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
      showToast({ message: getApiErrorMessage(error, "Couldn't change that. Try again.") });
    }
  };

  return {
    today,
    accounts,
    current: currentAccountOf(accounts),
    savings: savingsOf(accounts),
    debts,
    totals,
    // The first savings account whose balance may be out of date, for the mobile banner
    stale: savingsOf(accounts).find(account => isStale(account, today)) ?? null,
    setCounts: (account: Account, counts: boolean) => void setCounts(account, counts)
  };
};

export type Accounts = ReturnType<typeof useAccounts>;
