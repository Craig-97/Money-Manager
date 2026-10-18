import { PayoffChart } from '~/components/debts';
import { Button } from '~/components/ui/Button';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { chartText, STRATEGY_OPTIONS } from '../../debtsModel';
import { Debts, PayoffPlan } from '../../hooks';
import { ExtraChoices } from '../ExtraChoices';
import { PayoffOrder } from '../PayoffOrder';
import { PlanFigures } from '../PlanFigures';
import { StrategyNote } from '../StrategyNote';

const tileClasses = 'flex flex-col gap-4 rounded-3xl border border-border bg-surface p-4';

/* Mobile: the payoff plan as stacked cards, with the button to apply the extra at the end */
export const MobilePayoffPlan = ({ debts, plan }: { debts: Debts; plan: PayoffPlan }) => {
  const chart = chartText(plan.figures, { today: debts.today, left: debts.totals.left });

  return (
    <section aria-label="Payoff plan" className="flex flex-col gap-3.5">
      <div className={tileClasses}>
        <div>
          <p id="plan-strategy" className="mb-2 text-[13px] font-bold text-muted">
            When a debt is cleared
          </p>
          <SegmentedControl
            aria-labelledby="plan-strategy"
            value={plan.strategy}
            onValueChange={plan.setStrategy}
            options={STRATEGY_OPTIONS}
            fullWidth
            className="[&>button]:h-11 [&>button]:px-1.5"
          />
        </div>
        <StrategyNote strategy={plan.strategy} />
        <ExtraChoices extra={plan.extra} onChange={plan.setExtra} />
      </div>

      <div className={tileClasses}>
        <PlanFigures plan={plan} compact />
        <PayoffChart
          base={plan.figures.base.series}
          plan={plan.figures.plan.series}
          label={chart.label}
        />
      </div>

      <div>
        <h2 className="mb-2 px-1 text-xs font-bold tracking-[0.06em] text-muted uppercase">
          Order they&rsquo;re cleared
        </h2>
        <div className="rounded-3xl border border-border bg-surface px-4 py-2">
          <PayoffOrder plan={plan} />
        </div>
      </div>

      {plan.applyLabel ? (
        <Button
          variant="accent"
          onClick={plan.apply}
          loading={plan.applying}
          className="h-[52px] w-full">
          {plan.applyLabel}
        </Button>
      ) : null}
    </section>
  );
};
