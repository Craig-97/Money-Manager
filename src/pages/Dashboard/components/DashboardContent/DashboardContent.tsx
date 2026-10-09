import { MEDIA } from '~/constants';
import { Account } from '~/hooks/useAccount';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { useDashboard, usePaydayPrompt } from '../../hooks';
import { AlertStack } from '../alerts';
import {
  FreeToSpendTile,
  MobileDiscretionary,
  MobileFigures,
  MobileHero,
  MonthlyStats,
  NextPaydayTile
} from '../overview';
import { PaydayPrompt } from '../payday';
import { MobileBulkBar, MobilePayments, PaymentsTable } from '../payments';

// Only one layout is rendered, so each control exists once
export const DashboardContent = ({ account }: { account: Account }) => {
  const dashboard = useDashboard(account);
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const prompt = usePaydayPrompt({
    account,
    cycle: dashboard.cycle,
    today: dashboard.today,
    payments: dashboard.payments,
    summary: dashboard.summary,
    markPaid: dashboard.actions.pay
  });

  return (
    <>
      <PaydayPrompt prompt={prompt} />
      <AlertStack dashboard={dashboard} />
      {isDesktop ? (
        <section
          aria-label="Overview"
          className="grid gap-4 wide:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
          <FreeToSpendTile dashboard={dashboard} />
          <NextPaydayTile dashboard={dashboard} />
          <MonthlyStats dashboard={dashboard} />
          <PaymentsTable dashboard={dashboard} />
        </section>
      ) : (
        <section aria-label="Overview" className="flex flex-col gap-3.5">
          <MobileHero dashboard={dashboard} />
          <MobileFigures dashboard={dashboard} />
          <MobileDiscretionary dashboard={dashboard} />
          <MobilePayments dashboard={dashboard} />
          <MobileBulkBar dashboard={dashboard} />
        </section>
      )}
    </>
  );
};
