import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UpdateBudgetDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { usePayCycle } from '~/hooks/usePayCycle';
import { forFreeToSpend, isStale, savingsOf, toAccounts } from '~/lib/accounts';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import { summarise, toPayments } from '~/lib/payments';
import { showToast } from '~/state/toast';

const AMOUNT_ERROR = 'Enter an amount, like 1,250.00';

/*
 * Monthly income, with what it'd mean for free to spend shown as it's typed. The bank balance is
 * made of the accounts, changed on the Accounts page, so it's only shown here.
 */
export const useBalanceSettings = (budget: Budget) => {
  const { today, cycle } = usePayCycle(budget.payday);
  const [updateBudget, { loading: saving }] = useMutation(UpdateBudgetDocument);
  const [income, setIncome] = useState(() => formatMoneyInput(budget.monthlyIncome));
  const [submitted, setSubmitted] = useState(false);
  // What was last saved, so the form knows when it has changed
  const [saved, setSaved] = useState(income);

  const accounts = toAccounts(budget.accounts, today);
  const monthlyIncome = parseMoney(income);
  const summary = summarise({
    payments: forFreeToSpend(toPayments(budget, today)),
    bankBalance: budget.bankBalance,
    monthlyIncome: monthlyIncome ?? budget.monthlyIncome,
    cycle,
    today
  });
  const stale = savingsOf(accounts).find(account => isStale(account, today));

  const save = async () => {
    setSubmitted(true);
    if (monthlyIncome === null) return;
    try {
      await updateBudget({ variables: { id: budget.id, input: { monthlyIncome } } });
      setSubmitted(false);
      setSaved(income);
      showToast({ message: 'Income saved' });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't save your income. Try again.") });
    }
  };

  return {
    bankBalance: budget.bankBalance,
    // "From 1 of your 4 accounts"
    accountsText: `From ${accounts.filter(account => account.counts).length} of your ${accounts.length} ${accounts.length === 1 ? 'account' : 'accounts'}`,
    staleText: stale ? `${stale.name} needs updating` : null,
    income,
    setIncome,
    errors: {
      income: submitted && monthlyIncome === null ? AMOUNT_ERROR : undefined
    },
    summary,
    saving,
    isDirty: income !== saved,
    save: () => void save()
  };
};
