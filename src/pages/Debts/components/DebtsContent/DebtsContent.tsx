import { useState } from 'react';
import { OverpaymentDialog, PaymentsDialog } from '~/components/debts';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { Tile } from '~/components/ui/Tile';
import { MEDIA } from '~/constants';
import { Account } from '~/hooks/useAccount';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { useDebts, usePayoffPlan } from '../../hooks';
import { DebtsHero } from '../DebtsHero';
import { DebtsTable } from '../DebtsTable';
import { MobileDebtList } from '../MobileDebtList';
import { MobileDebtsHero } from '../MobileDebtsHero';
import { MobilePayoffPlan } from '../MobilePayoffPlan';
import { NoDebts } from '../NoDebts';
import { PaidOffTile } from '../PaidOffTile';
import { PayoffPlanTile } from '../PayoffPlanTile';

type DebtsView = 'debts' | 'plan';

/*
 * The page once the account has loaded: what's left, then the debts or the payoff plan behind a
 * tab, so the list stays the main view. Only one layout is rendered.
 */
export const DebtsContent = ({ account }: { account: Account }) => {
  const debts = useDebts(account);
  const plan = usePayoffPlan(debts);
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const [view, setView] = useState<DebtsView>('debts');

  if (!debts.debts.length) {
    return (
      <Tile flat aria-label="Your debts">
        <NoDebts />
      </Tile>
    );
  }

  const tabs = (
    <SegmentedControl
      aria-label="Show"
      value={view}
      onValueChange={setView}
      options={[
        { value: 'debts', label: 'Your debts', count: isDesktop ? debts.debts.length : undefined },
        { value: 'plan', label: 'Payoff plan' }
      ]}
      size={isDesktop ? 'lg' : 'sm'}
      fullWidth={!isDesktop}
      className={isDesktop ? undefined : '[&>button]:h-11'}
    />
  );
  const dialogs = (
    <>
      <OverpaymentDialog debts={debts.debts} onOverpay={debts.actions.overpay} />
      <PaymentsDialog
        debts={debts.debts}
        today={debts.today}
        onUndoOverpayment={(id, name) => void debts.actions.undoOverpayment(id, name)}
      />
    </>
  );

  return isDesktop ? (
    <section aria-label="Debts" className="flex flex-col gap-4">
      <div className="grid items-stretch gap-4 min-[68.75rem]:grid-cols-[minmax(0,1.65fr)_minmax(0,1fr)]">
        <DebtsHero debts={debts} />
        <PaidOffTile debts={debts} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        {tabs}
        <p className="text-sm font-semibold text-muted">
          As you are now,{' '}
          {plan.figures.base.months === null
            ? 'not cleared at these payments'
            : `debt-free ${plan.figures.baseFreeBy}`}
        </p>
      </div>
      {view === 'debts' ? (
        <DebtsTable debts={debts} />
      ) : (
        <PayoffPlanTile debts={debts} plan={plan} />
      )}
      {dialogs}
    </section>
  ) : (
    <section aria-label="Debts" className="flex flex-col gap-3.5">
      <MobileDebtsHero debts={debts} />
      {tabs}
      {view === 'debts' ? (
        <MobileDebtList debts={debts} />
      ) : (
        <MobilePayoffPlan debts={debts} plan={plan} />
      )}
      {dialogs}
    </section>
  );
};
