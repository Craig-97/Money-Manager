import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { UpdateAccountDocument } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { usePayCycle } from '~/hooks/usePayCycle';
import { getApiErrorMessage } from '~/lib/errors';
import { formatMoneyInput, parseMoney } from '~/lib/format';
import { summarise, toPayments } from '~/lib/payments';
import { showToast } from '~/state/toast';

const AMOUNT_ERROR = 'Enter an amount, like 1,250.00';

/* Bank balance and income, with what they'd mean for free to spend shown as they're typed */
export const useBalanceSettings = (account: Account) => {
  const { today, cycle } = usePayCycle(account.payday);
  const [updateAccount, { loading: saving }] = useMutation(UpdateAccountDocument);
  const [balance, setBalance] = useState(() => formatMoneyInput(account.bankBalance));
  const [income, setIncome] = useState(() => formatMoneyInput(account.monthlyIncome));
  const [submitted, setSubmitted] = useState(false);
  // What was last saved, so the form knows when it has changed
  const [saved, setSaved] = useState({ balance, income });

  const bankBalance = parseMoney(balance);
  const monthlyIncome = parseMoney(income);
  const summary = summarise({
    payments: toPayments(account, today),
    bankBalance: bankBalance ?? account.bankBalance,
    monthlyIncome: monthlyIncome ?? account.monthlyIncome,
    cycle,
    today
  });

  const save = async () => {
    setSubmitted(true);
    if (bankBalance === null || monthlyIncome === null) return;
    try {
      await updateAccount({ variables: { id: account.id, input: { bankBalance, monthlyIncome } } });
      setSubmitted(false);
      setSaved({ balance, income });
      showToast({ message: 'Balances saved' });
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't save your balances. Try again.") });
    }
  };

  return {
    balance,
    setBalance,
    income,
    setIncome,
    errors: {
      balance: submitted && bankBalance === null ? AMOUNT_ERROR : undefined,
      income: submitted && monthlyIncome === null ? AMOUNT_ERROR : undefined
    },
    summary,
    saving,
    isDirty: balance !== saved.balance || income !== saved.income,
    save: () => void save()
  };
};
