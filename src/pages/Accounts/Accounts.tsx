import { Plus } from 'lucide-react';
import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { ReminderBell } from '~/components/reminders';
import { Button } from '~/components/ui/Button';
import { IconButton } from '~/components/ui/IconButton';
import { SegmentedControl } from '~/components/ui/SegmentedControl';
import { useBudget } from '~/hooks/useBudget';
import { useAccountDialogStore } from '~/state/accountDialog';
import { AccountsContent, AccountsSkeleton } from './components';
import { ACCOUNTS_VIEWS, useAccountsView } from './hooks';

const DESCRIPTIONS = {
  balances: 'Your spending accounts, savings and what you owe, all in one place.',
  before: 'What each account has left by payday, once its own payments go out.'
} as const;

export const Accounts = () => {
  const { budget, loading, retry } = useBudget();
  const openAdd = useAccountDialogStore(s => s.openAdd);
  const views = useAccountsView(budget);

  return (
    <>
      <PageHeader
        title="Accounts"
        description={DESCRIPTIONS[views.view]}
        actions={
          budget ? (
            <>
              {views.several ? (
                <SegmentedControl
                  aria-label="Accounts view"
                  value={views.view}
                  onValueChange={views.setView}
                  options={ACCOUNTS_VIEWS}
                />
              ) : null}
              <Button variant="accent" size="lg" onClick={openAdd} className="px-5">
                <Plus size={16} strokeWidth={2.25} aria-hidden="true" />
                Add account
              </Button>
            </>
          ) : null
        }
        mobileActions={
          budget ? (
            <>
              <IconButton
                variant="outline"
                aria-label="Add account"
                aria-haspopup="dialog"
                onClick={openAdd}>
                <Plus size={18} strokeWidth={2.25} aria-hidden="true" />
              </IconButton>
              <ReminderBell />
            </>
          ) : undefined
        }
      />
      {budget ? (
        <AccountsContent budget={budget} views={views} />
      ) : loading ? (
        <AccountsSkeleton />
      ) : (
        <BudgetError onRetry={retry} />
      )}
    </>
  );
};
