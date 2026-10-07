import { Plus, Repeat } from 'lucide-react';
import { AccountError } from '~/components/feedback/AccountError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { MEDIA } from '~/constants';
import { Account, useAccount } from '~/hooks/useAccount';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import {
  DueTodayBanner,
  FreeToSpendTile,
  MobileBulkBar,
  MobileDiscretionary,
  MobileFigures,
  MobileHero,
  MobilePayments,
  MonthlyStats,
  NextPaydayTile,
  PaydayPrompt,
  PaymentsTable,
  DashboardSkeleton
} from './components';
import { useDashboard, usePaydayPrompt } from './hooks';

// Only one layout is rendered, so each control exists once
const DashboardContent = ({ account }: { account: Account }) => {
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
      <DueTodayBanner dashboard={dashboard} />
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

export const Dashboard = () => {
  const { account, loading, retry } = useAccount();
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          account ? (
            <>
              <Button size="lg" onClick={() => openAdd('oneOff')} className="px-5">
                <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
                One-off payment
              </Button>
              <Button
                variant="accent"
                size="lg"
                onClick={() => openAdd('recurring')}
                className="px-5">
                <Repeat size={16} strokeWidth={2.25} aria-hidden="true" />
                Recurring payment
              </Button>
            </>
          ) : null
        }
      />
      {account ? (
        <DashboardContent account={account} />
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <AccountError onRetry={retry} />
      )}
    </>
  );
};
