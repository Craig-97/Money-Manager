import { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { AccountError } from '~/components/feedback/AccountError';
import { PageHeader } from '~/components/layout/PageHeader';
import { IconButton } from '~/components/ui/IconButton';
import { useAccount } from '~/hooks/useAccount';
import { RemindersContent, RemindersSkeleton, SettingsSheet } from './components';
import { useRemindersPage } from './hooks';

export const Reminders = () => {
  const { account, loading, retry } = useAccount();
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
      {account ? (
        <>
          <RemindersContent page={page} />
          <SettingsSheet page={page} open={settingsOpen} onOpenChange={setSettingsOpen} />
        </>
      ) : loading ? (
        <RemindersSkeleton />
      ) : (
        <AccountError onRetry={retry} />
      )}
    </>
  );
};
