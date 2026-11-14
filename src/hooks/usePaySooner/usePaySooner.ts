import { useState } from 'react';
import { applyChange, clearedText, comparedToNow, DebtPayment, simulatePayoff } from '~/lib/debts';
import { formatMoney } from '~/lib/format';

interface Options {
  debt: DebtPayment | undefined;
  today: Date;
  onPayMore: (debt: DebtPayment, amount: number) => Promise<void>;
  // Changing it starts again from no extra, as each opening of the dialog does
  formKey?: string;
}

/* The largest extra the slider offers: twice the payment, at least £200, in steps of £10 */
const maxExtra = (debt: DebtPayment) => Math.max(200, Math.ceil((debt.amount * 2) / 10) * 10);

/*
 * Paying one debt off sooner: some extra a month against how it's going now. Applying the extra
 * raises its payment from the next one. Null until there's a debt to show.
 */
export const usePaySooner = ({ debt, today, onPayMore, formKey }: Options) => {
  const [extra, setExtra] = useState(0);
  const [applying, setApplying] = useState(false);

  const [currentKey, setCurrentKey] = useState(formKey);
  if (formKey !== currentKey) {
    setCurrentKey(formKey);
    setExtra(0);
  }

  if (!debt) return null;

  const base = simulatePayoff([debt]);
  const plan = simulatePayoff([debt], { extra, strategy: 'avalanche' });
  const change = applyChange(debt, extra);

  const apply = async () => {
    setApplying(true);
    await onPayMore(debt, change.amount);
    setApplying(false);
    setExtra(0);
  };

  return {
    debt,
    extra,
    setExtra,
    maxExtra: maxExtra(debt),
    base,
    plan,
    clearBy: clearedText(plan.months, today),
    ...comparedToNow(base, plan),
    // "Pay £200 a month from November", once there's extra to apply
    applyLabel:
      extra > 0 && debt.dueDate
        ? `Pay ${formatMoney(change.amount, { whole: Number.isInteger(change.amount) })} ${debt.frequency === 'MONTHLY' ? 'a month' : 'each time'} from ${change.from}`
        : null,
    apply: () => void apply(),
    applying
  };
};

export type PaySooner = NonNullable<ReturnType<typeof usePaySooner>>;
