import { ArrowUp, Plus } from 'lucide-react';
import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { useBudget } from '~/hooks/useBudget';
import { useDebtDialogStore } from '~/state/debtDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { DebtsContent, DebtsSkeleton } from './components';

export const Debts = () => {
  const { budget, loading, retry } = useBudget();
  const openAddDebt = usePaymentDialogStore(s => s.openAddDebt);
  const openOverpayment = useDebtDialogStore(s => s.openOverpayment);
  const hasDebts = !!budget?.recurringPayments?.some(payment => payment?.debt);

  return (
    <>
      <PageHeader
        title="Debts"
        description="Loans and cards you’re paying off, built from your recurring payments."
        actions={
          budget ? (
            <div className="flex shrink-0 items-center gap-2">
              {hasDebts ? (
                <Button size="lg" onClick={() => openOverpayment()} className="px-5">
                  <ArrowUp size={16} strokeWidth={2.25} aria-hidden="true" />
                  Log an overpayment
                </Button>
              ) : null}
              <Button variant="accent" size="lg" onClick={openAddDebt} className="px-5">
                <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
                Add a debt
              </Button>
            </div>
          ) : null
        }
      />
      {budget ? (
        <DebtsContent budget={budget} />
      ) : loading ? (
        <DebtsSkeleton />
      ) : (
        <BudgetError onRetry={retry} />
      )}
    </>
  );
};
