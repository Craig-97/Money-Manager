import { Plus } from 'lucide-react';
import { AccountError } from '~/components/feedback/AccountError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { useAccount } from '~/hooks/useAccount';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { DebtsContent, DebtsSkeleton } from './components';

export const Debts = () => {
  const { account, loading, retry } = useAccount();
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <>
      <PageHeader
        title="Debts"
        description="What you owe, and when it'll be paid off."
        actions={
          account ? (
            <Button
              variant="accent"
              size="lg"
              onClick={() => openAdd('recurring')}
              className="px-5">
              <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
              Add a debt
            </Button>
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
