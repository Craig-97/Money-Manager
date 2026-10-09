import { Repeat } from 'lucide-react';
import { AccountError } from '~/components/feedback/AccountError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { useAccount } from '~/hooks/useAccount';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { RecurringContent, RecurringSkeleton } from './components';

export const Recurring = () => {
  const { account, loading, retry } = useAccount();
  const openAdd = usePaymentDialogStore(s => s.openAdd);

  return (
    <>
      <PageHeader
        title="Recurring payments"
        actions={
          account ? (
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
      {account ? (
        <RecurringContent account={account} />
      ) : loading ? (
        <RecurringSkeleton />
      ) : (
        <AccountError onRetry={retry} />
      )}
    </>
  );
};
