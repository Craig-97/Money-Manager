import { useState } from 'react';
import { PayoffStrategy } from '~/lib/debts';
import { formatMoney } from '~/lib/format';
import { applyChange, planFigures } from '../../debtsModel';
import { Debts } from '../useDebts';

/*
 * The payoff plan: a strategy and some extra a month to try against how things are now. Nothing
 * changes until the extra is applied, which raises one debt's payment by it.
 */
export const usePayoffPlan = ({ debts, today, base, actions }: Debts) => {
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  const [extra, setExtra] = useState(0);
  const [applying, setApplying] = useState(false);

  const figures = planFigures(debts, strategy, extra, today, base);
  const change = figures.target && extra > 0 ? applyChange(figures.target, extra) : null;

  const apply = async () => {
    if (!figures.target || !change) return;
    setApplying(true);
    await actions.payMore(figures.target, change.amount);
    setApplying(false);
    setExtra(0);
  };

  return {
    strategy,
    setStrategy,
    extra,
    setExtra,
    figures,
    // "Pay £50 extra from November", when there's extra to apply
    applyLabel: change
      ? `Pay ${formatMoney(extra, { whole: true })} extra from ${change.from}`
      : null,
    apply: () => void apply(),
    applying
  };
};

export type PayoffPlan = ReturnType<typeof usePayoffPlan>;
