import { useMutation } from '@apollo/client/react';
import { addReminderStates } from '~/graphql/cache';
import {
  ReminderAction,
  UpdateOneOffPaymentDocument,
  UpdateRecurringPaymentDocument,
  UpdateReminderSettingsDocument,
  UpdateRemindersDocument
} from '~/graphql/generated';
import { addDays, formatShortDay, toApiDate } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { Payment, ReminderSettings, ReminderTiming } from '~/lib/payments';
import { canClear, laterUntil, Reminder, ReminderStates } from '~/lib/reminders';
import { showToast } from '~/state/toast';

const showError = (error: unknown) =>
  showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });

// A day as the API sends it back: midnight UTC in epoch milliseconds
const apiDay = (date: Date) => String(Date.parse(`${toApiDate(date)}T00:00:00Z`));

interface Options {
  budgetId: string | null;
  states: ReminderStates;
  today: Date;
}

/*
 * What can be done with reminders: read, clear or put them away until later, each undoable, and
 * when they go off. Each change shows straight away and is saved to the budget.
 */
export const useReminderActions = ({ budgetId, states, today }: Options) => {
  const [updateReminders] = useMutation(UpdateRemindersDocument);
  const [updateSettings] = useMutation(UpdateReminderSettingsDocument);
  const [updateRecurring] = useMutation(UpdateRecurringPaymentDocument);
  const [updateOneOff] = useMutation(UpdateOneOffPaymentDocument);

  const update = async (
    keys: string[],
    { action, until }: { action: ReminderAction; until?: Date }
  ) => {
    if (!budgetId || !keys.length) return false;
    // What each will be once saved, so it shows at once
    const optimistic = keys.map(key => {
      const state = states.get(key);
      const before = {
        read: state?.read ?? false,
        cleared: state?.cleared ?? false,
        snoozedUntil: state?.snoozedUntil ? apiDay(state.snoozedUntil) : null
      };
      const after =
        action === 'READ'
          ? { ...before, read: true }
          : action === 'CLEAR'
            ? { ...before, cleared: true }
            : action === 'LATER'
              ? { ...before, read: false, snoozedUntil: apiDay(until!) }
              : { ...before, cleared: false, snoozedUntil: null };
      return { __typename: 'ReminderState' as const, key, ...after };
    });
    try {
      await updateReminders({
        variables: {
          input: { budgetId, keys, action, until: until ? toApiDate(until) : undefined }
        },
        optimisticResponse: {
          updateReminders: { __typename: 'ReminderStatesResponse', states: optimistic }
        },
        update: (cache, { data }) => {
          if (data)
            addReminderStates(cache, { budget: budgetId, states: data.updateReminders.states });
        }
      });
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const restore = (keys: string[]) => void update(keys, { action: 'RESTORE' });

  return {
    markRead: (reminders: readonly Reminder[]) =>
      void update(
        reminders.filter(reminder => !reminder.read).map(reminder => reminder.key),
        { action: 'READ' }
      ),

    clear: async (reminder: Pick<Reminder, 'key' | 'kind'>) => {
      if (!canClear(reminder)) return;
      if (await update([reminder.key], { action: 'CLEAR' })) {
        showToast({
          message: 'Reminder cleared',
          action: { label: 'Undo', onClick: () => restore([reminder.key]) }
        });
      }
    },

    later: async (reminder: Pick<Reminder, 'key' | 'kind'>) => {
      const until = laterUntil(reminder, today);
      if (await update([reminder.key], { action: 'LATER', until })) {
        const back =
          until.getTime() === addDays(today, 1).getTime() ? 'tomorrow' : formatShortDay(until);
        showToast({
          message: `It’ll be back ${back}`,
          action: { label: 'Undo', onClick: () => restore([reminder.key]) }
        });
      }
    },

    /* Clears everything in New that can be; overdue payments stay until paid or skipped */
    clearAll: async (reminders: readonly Reminder[]) => {
      const keys = reminders.filter(canClear).map(reminder => reminder.key);
      if (keys.length && (await update(keys, { action: 'CLEAR' }))) {
        showToast({
          message: `${keys.length} ${keys.length === 1 ? 'reminder' : 'reminders'} cleared`,
          action: { label: 'Undo', onClick: () => restore(keys) }
        });
      }
    },

    /* The usual timing, for anything without its own */
    changeSettings: async (changes: Partial<ReminderSettings>, current: ReminderSettings) => {
      if (!budgetId) return;
      try {
        await updateSettings({
          variables: { input: { budgetId, ...changes } },
          optimisticResponse: {
            updateReminderSettings: {
              __typename: 'BudgetResponse',
              budget: {
                __typename: 'Budget',
                id: budgetId,
                reminderSettings: { __typename: 'ReminderSettings', ...current, ...changes }
              }
            }
          }
        });
      } catch (error) {
        showError(error);
      }
    },

    /* One payment's own timing, for when it's due or, for a recurring one, when it renews */
    changeTiming: async (
      payment: Pick<Payment, 'id' | 'kind'>,
      { which, timing }: { which: 'dueReminder' | 'renewalReminder'; timing: ReminderTiming }
    ) => {
      try {
        if (payment.kind === 'oneOff') {
          await updateOneOff({ variables: { id: payment.id, input: { dueReminder: timing } } });
        } else {
          await updateRecurring({ variables: { id: payment.id, input: { [which]: timing } } });
        }
        return true;
      } catch (error) {
        showError(error);
        return false;
      }
    }
  };
};

export type ReminderActions = ReturnType<typeof useReminderActions>;
