import { PayoffChart } from '~/components/debts';
import { Button } from '~/components/ui/Button';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { chartText, STRATEGY_OPTIONS } from '../../debtsModel';
import { Debts, PayoffPlan } from '../../hooks';
import { ExtraChoices } from '../ExtraChoices';
import { PayoffOrder } from '../PayoffOrder';
import { PlanFigures } from '../PlanFigures';
import { StrategyNote } from '../StrategyNote';

/*
 * Desktop: try a different order or a little extra each month against how things are now.
 * Nothing changes until the extra is applied.
 */
export const PayoffPlanTile = ({ debts, plan }: { debts: Debts; plan: PayoffPlan }) => {
  const chart = chartText(plan.figures, debts.today, debts.totals.left);

  return (
    <article
      aria-labelledby="plan-title"
      className="flex flex-col gap-5 rounded-3xl border border-border bg-surface p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="plan-title" className="text-[19px] font-extrabold tracking-[-0.02em]">
            Payoff plan
          </h2>
          <p className="mt-1 text-sm font-medium text-muted">
            Try a different order, or a little extra each month. Nothing changes until you choose to
            apply it.
          </p>
        </div>
        <SegmentedControl
          aria-label="When a debt is cleared"
          value={plan.strategy}
          onValueChange={plan.setStrategy}
          options={STRATEGY_OPTIONS}
          size="lg"
        />
      </div>

      <div className="grid gap-6 min-[68.75rem]:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        <div className="flex flex-col gap-5">
          <ExtraChoices extra={plan.extra} onChange={plan.setExtra} />
          <StrategyNote strategy={plan.strategy} />
          <div>
            <h3 className="mb-1 text-[13px] font-bold text-muted">Order</h3>
            <PayoffOrder plan={plan} />
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-5">
          <PlanFigures plan={plan} />
          <PayoffChart
            base={plan.figures.base.series}
            plan={plan.figures.plan.series}
            label={chart.label}
            startLabel={chart.start}
            endLabel={chart.end}
          />
          {plan.applyLabel ? (
            <Button
              variant="accent"
              size="lg"
              onClick={plan.apply}
              loading={plan.applying}
              className="self-end px-5">
              {plan.applyLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </article>
  );
};
