import { useMutation } from '@apollo/client/react';
import { ResetCalendarFeedDocument, UpdateCalendarFeedDocument } from '~/graphql/generated';
import { Budget } from '~/hooks/useBudget';
import { getApiErrorMessage } from '~/lib/errors';
import { showToast } from '~/state/toast';

export type FeedInclude = 'payments' | 'paydays' | 'renewals' | 'notes' | 'debtFree';

export const FEED_INCLUDES: { value: FeedInclude; label: string }[] = [
  { value: 'payments', label: 'Payments due' },
  { value: 'paydays', label: 'Paydays' },
  { value: 'renewals', label: 'Renewals' },
  { value: 'notes', label: 'Note dates' },
  { value: 'debtFree', label: 'Debt-free dates' }
];

const showError = (error: unknown) =>
  showToast({ message: getApiErrorMessage(error, "Couldn't save that. Try again.") });

/*
 * The feed's addresses. The app reaches the API through its own origin, so the feed is there too:
 * https for copying, webcal for calendar apps that subscribe from a link.
 */
export const feedUrls = (token: string, origin = window.location.origin) => {
  const https = `${origin}/cal/${token}.ics`;
  const webcal = https.replace(/^https?:/, 'webcal:');
  return {
    https,
    webcal,
    // The secret hidden, for showing on screen
    shown: webcal.replace(token, '•'.repeat(16)),
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`,
    outlook: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(https)}&name=${encodeURIComponent('Money Manager')}`
  };
};

/* The calendar feed: turning it on or off, what it carries, and a new address */
export const useCalendarFeed = (budget: Budget) => {
  const [updateFeed] = useMutation(UpdateCalendarFeedDocument);
  const [resetFeed, { loading: resetting }] = useMutation(ResetCalendarFeedDocument);
  const feed = budget.calendarFeed;

  const update = async (
    changes: Partial<Record<FeedInclude | 'showAmounts' | 'enabled', boolean>>
  ) => {
    const { enabled, ...include } = changes;
    try {
      await updateFeed({
        variables: { input: { budgetId: budget.id, ...changes } },
        // Switches move at once; turning it on waits for its new address
        ...(enabled === undefined
          ? {
              optimisticResponse: {
                updateCalendarFeed: {
                  __typename: 'BudgetResponse' as const,
                  budget: {
                    __typename: 'Budget' as const,
                    id: budget.id,
                    calendarFeed: { ...feed, ...include }
                  }
                }
              }
            }
          : {})
      });
    } catch (error) {
      showError(error);
    }
  };

  return {
    feed,
    on: !!feed.token,
    urls: feed.token ? feedUrls(feed.token) : null,
    turnOn: () => void update({ enabled: true }),
    turnOff: () => void update({ enabled: false }),
    toggle: (field: FeedInclude | 'showAmounts') => void update({ [field]: !feed[field] }),
    resetting,
    reset: async () => {
      try {
        await resetFeed({ variables: { budgetId: budget.id } });
        showToast({ message: 'New link made. Add it to your calendar again.' });
      } catch (error) {
        showError(error);
      }
    },
    copy: async () => {
      if (!feed.token) return;
      try {
        await navigator.clipboard.writeText(feedUrls(feed.token).https);
        showToast({ message: 'Link copied' });
      } catch {
        showToast({ message: "Couldn't copy the link. Select it and copy it instead." });
      }
    }
  };
};
