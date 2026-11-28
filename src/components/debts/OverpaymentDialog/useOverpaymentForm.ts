import { useState } from 'react';
import { DebtPayment } from '~/lib/debts';
import { formatMoney, parseMoney } from '~/lib/format';

/*
 * The overpayment form: which debt and how much. It starts afresh each time the dialog opens, on the
 * debt it was opened for, or the first debt when it was opened from the page header.
 */
interface Options {
  debts: readonly DebtPayment[];
  // The debt it was opened for; the first debt when opened from the page header
  debtId: string | undefined;
  // Changes with each opening, which starts the form afresh
  formKey: string;
  onOverpay: (debt: DebtPayment, amount: number) => Promise<string | null>;
  onDone: () => void;
}

export const useOverpaymentForm = ({ debts, debtId, formKey, onOverpay, onDone }: Options) => {
  const [chosen, setChosen] = useState(debtId);
  const [amountText, setAmountText] = useState('');
  const [touched, setTouched] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentKey, setCurrentKey] = useState(formKey);
  if (formKey !== currentKey) {
    setCurrentKey(formKey);
    setChosen(debtId);
    setAmountText('');
    setTouched(false);
    setApiError(null);
  }

  const debt = debts.find(item => item.id === chosen) ?? debts[0];
  const amount = parseMoney(amountText);
  const left = debt?.debt.balance ?? 0;
  const problem =
    amount === null || amount <= 0
      ? 'Enter an amount above £0'
      : amount > left
        ? `That's more than the ${formatMoney(left)} left`
        : null;

  const save = async () => {
    setTouched(true);
    if (!debt || problem || amount === null) return;
    setSaving(true);
    const error = await onOverpay(debt, amount);
    setSaving(false);
    if (error) setApiError(error);
    else onDone();
  };

  return {
    debt,
    choose: (id: string) => {
      setChosen(id);
      setApiError(null);
    },
    amountText,
    setAmount: (value: string) => {
      setAmountText(value);
      setApiError(null);
    },
    touch: () => setTouched(true),
    error: apiError ?? (touched ? problem : null),
    canSave: !problem && !saving,
    saving,
    save: () => void save()
  };
};
