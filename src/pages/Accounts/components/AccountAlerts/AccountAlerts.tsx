import { useState } from 'react';
import { Landmark, Percent, RefreshCw } from 'lucide-react';
import { Alert, AlertStack } from '~/components/alerts';
import { useReminderActions } from '~/hooks/useReminderActions';
import { useReminders } from '~/hooks/useReminders';
import { useAccountQuickStore } from '~/state/accountQuick';

/*
 * The Accounts page's alerts, as the dashboard's: interest the app added, to check against the bank,
 * and balances that may be out of date. Each is its reminder in New, so Later and × do what they do
 * there, and typing in the balance clears both.
 */
export const AccountAlerts = () => {
  const { budgetId, states, today, fresh } = useReminders();
  const actions = useReminderActions({ budgetId, states, today });
  const openQuick = useAccountQuickStore(s => s.openFor);
  const [index, setIndex] = useState(0);
  const alerts = fresh.filter(
    reminder =>
      (reminder.kind === 'interestAdded' || reminder.kind === 'balance') && reminder.account
  );
  // Dealing with the last one moves back to the one before
  const current = Math.min(index, Math.max(0, alerts.length - 1));

  return (
    <AlertStack
      index={current}
      onGo={next => setIndex(Math.max(0, Math.min(alerts.length - 1, next)))}
      alerts={alerts.map(reminder => ({
        key: reminder.key,
        label: reminder.title,
        content: (
          <Alert
            icon={reminder.kind === 'interestAdded' ? Percent : Landmark}
            tone={reminder.kind === 'interestAdded' ? 'income' : 'warn'}
            title={reminder.title}
            subline={reminder.body}
            onLater={() => void actions.later(reminder)}
            action={{
              label: 'Update balance',
              icon: RefreshCw,
              opensDialog: true,
              onClick: () => openQuick('balance', { accountId: reminder.account!.id })
            }}
            onClear={() => void actions.clear(reminder)}
            clearLabel={reminder.title}
          />
        )
      }))}
    />
  );
};
