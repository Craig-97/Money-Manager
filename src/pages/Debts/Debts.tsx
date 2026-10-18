import { ArrowUp, Plus } from 'lucide-react';
import { AccountError } from '~/components/feedback/AccountError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { useAccount } from '~/hooks/useAccount';
import { useDebtDialogStore } from '~/state/debtDialog';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { DebtsContent, DebtsSkeleton } from './components';

export const Debts = () => {
  const { account, loading, retry } = useAccount();
  const openAddDebt = usePaymentDialogStore(s => s.openAddDebt);
  const openOverpayment = useDebtDialogStore(s => s.openOverpayment);
  const hasDebts = !!account?.recurringPayments?.some(payment => payment?.debt);

  return (
    <>
      <PageHeader
        title="Debts"
        description="Loans and cards you’re paying off, built from your recurring payments."
        actions={
          account ? (
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
      {account ? (
        <DebtsContent account={account} />
      ) : loading ? (
        <DebtsSkeleton />
      ) : (
        <AccountError onRetry={retry} />
      )}
    </>
  );
};
