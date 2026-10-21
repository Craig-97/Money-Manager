import { useState } from 'react';
import { formatMonthYear } from '~/lib/dates';
import { DebtPayment, extraPerPayment, monthFromNow, simulatePayoff } from '~/lib/debts';
import { formatMoney } from '~/lib/format';

interface Options {
  debt: DebtPayment | undefined;
  today: Date;
  onPayMore: (debt: DebtPayment, amount: number) => Promise<void>;
  // Changing it starts again from no extra, as each opening of the dialog does
  formKey?: string;
}

const MONTH_NAME = new Intl.DateTimeFormat('en-GB', { month: 'long' });

const monthsText = (months: number) => `${months} ${months === 1 ? 'month' : 'months'}`;

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
  const cleared = (months: number | null) =>
    months === null ? 'Never' : formatMonthYear(monthFromNow(today, months));
  const sooner = base.months !== null && plan.months !== null ? base.months - plan.months : 0;
  const saved = Math.round(base.interest - plan.interest);
  const newAmount = Math.round((debt.amount + extraPerPayment(debt, extra)) * 100) / 100;

  const apply = async () => {
    setApplying(true);
    await onPayMore(debt, newAmount);
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
    clearBy: cleared(plan.months),
    sooner:
      base.months === null && plan.months !== null
        ? 'Cleared at last'
        : sooner > 0
          ? `${monthsText(sooner)} sooner`
          : 'As now',
    saved: saved > 0 ? `${formatMoney(saved, { whole: true })} less` : 'Same as now',
    // "Pay £200 a month from November", once there's extra to apply
    applyLabel:
      extra > 0 && debt.dueDate
        ? `Pay ${formatMoney(newAmount, { whole: Number.isInteger(newAmount) })} ${debt.frequency === 'MONTHLY' ? 'a month' : 'each time'} from ${MONTH_NAME.format(debt.dueDate)}`
        : null,
    apply: () => void apply(),
    applying
  };
};

export type PaySooner = NonNullable<ReturnType<typeof usePaySooner>>;
