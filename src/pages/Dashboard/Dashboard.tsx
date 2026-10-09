import { Plus, Repeat } from 'lucide-react';
import { AccountError } from '~/components/feedback/AccountError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { useAccount } from '~/hooks/useAccount';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { DashboardContent, DashboardSkeleton } from './components';

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
