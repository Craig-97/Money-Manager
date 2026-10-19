import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { BudgetError } from '~/components/feedback/BudgetError';
import { PageHeader } from '~/components/layout/PageHeader';
import { IconButton } from '~/components/ui/IconButton';
import { useBudget } from '~/hooks/useBudget';
import { RemindersContent, RemindersSkeleton, SettingsSheet } from './components';
import { useRemindersPage } from './hooks';

export const Reminders = () => {
  const { budget, loading, retry } = useBudget();
  const page = useRemindersPage();
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Reminders"
        description="Reminders that have gone off, and what’s coming up next."
        mobileActions={
          <IconButton
            variant="outline"
            aria-label="Reminder settings"
            aria-haspopup="dialog"
            onClick={() => setSettingsOpen(true)}>
            <SlidersHorizontal size={18} aria-hidden="true" />
          </IconButton>
        }
      />
      {budget ? (
        <>
          <RemindersContent page={page} />
          <SettingsSheet page={page} open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
      ) : loading ? (
        <RemindersSkeleton />
      ) : (
        <BudgetError onRetry={retry} />
      )}
    </>
  );
};
