import { Repeat } from 'lucide-react';
import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { useBudget } from '~/hooks/useBudget';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { RecurringContent, RecurringSkeleton } from './components';

export const Recurring = () => {
  const { budget, loading, retry } = useBudget();
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <>
      <PageHeader
        title="Recurring payments"
        actions={
          budget ? (
            <Button
              variant="accent"
              size="lg"
              onClick={() => openAdd('recurring')}
              className="px-5">
              <Repeat size={16} strokeWidth={2.25} aria-hidden="true" />
              Recurring payment
            </Button>
          ) : null
        }
      />
      {budget ? (
        <RecurringContent budget={budget} />
      ) : loading ? (
        <RecurringSkeleton />
      ) : (
        <BudgetError onRetry={retry} />
      )}
    </>
  );
};
