import { Plus } from 'lucide-react';
import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { Button } from '~/components/ui/Button';
import { useBudget } from '~/hooks/useBudget';
import { useAccountDialogStore } from '~/state/accountDialog';
import { AccountsContent, AccountsSkeleton } from './components';

export const Accounts = () => {
  const { budget, loading, retry } = useBudget();
  const openAdd = useAccountDialogStore(s => s.openAdd);

  return (
    <>
      <PageHeader
        title="Accounts"
        description="Your accounts, savings and what you owe, all in one place."
        actions={
          budget ? (
            <Button variant="accent" size="lg" onClick={openAdd} className="px-5">
              <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
              Add account
            </Button>
          ) : null
        }
      />
      {budget ? (
        <AccountsContent budget={budget} />
      ) : loading ? (
        <AccountsSkeleton />
      ) : (
        <BudgetError onRetry={retry} />
      )}
    </>
  );
};
