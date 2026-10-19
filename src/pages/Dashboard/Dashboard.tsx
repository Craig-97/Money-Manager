import { Plus, Repeat } from 'lucide-react';
import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { useBudget } from '~/hooks/useBudget';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { DashboardContent, DashboardSkeleton } from './components';

export const Dashboard = () => {
  const { budget, loading, retry } = useBudget();
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <>
      <PageHeader
        title="Dashboard"
        actions={
          budget ? (
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
      {budget ? (
        <DashboardContent budget={budget} />
      ) : loading ? (
        <DashboardSkeleton />
      ) : (
        <BudgetError onRetry={retry} />
      )}
    </>
  );
};
