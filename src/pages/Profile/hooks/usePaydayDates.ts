import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { SetPaydayOverrideDocument } from '~/graphql/generated';
import { addDays, parseIsoDate, startOfToday, toIsoDate } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { formatShortDate } from '~/lib/payments';
import { showToast } from '~/state/toast';
import { PaydayPreview } from '../profileModel';

export type QuickPick = 'before' | 'week' | 'pick';

// How the quick picks move the date being changed
const QUICK_DAYS: Record<Exclude<QuickPick, 'pick'>, number> = { before: -1, week: -7 };

/*
 * Changing a single upcoming payday: tap its date, choose the new one. `paydayId` is the saved
 * payday; `locked` stops edits while the form above has changes that aren't saved, because a
 * move belongs to the date the saved rule gives.
 */
export const usePaydayDates = (
  paydayId: string | undefined,
  preview: PaydayPreview[],
  locked: boolean
) => {
  const [setOverride, { loading: saving }] = useMutation(SetPaydayOverrideDocument);
  const [editing, setEditing] = useState<number | null>(null);
  const [quick, setQuick] = useState<QuickPick>('before');
  const [draft, setDraft] = useState('');

  const item = editing === null ? undefined : preview[editing];
  const next = editing === null ? undefined : preview[editing + 1];
  const chosen = parseIsoDate(draft);
  const today = startOfToday();

  // A payday can't be before today or run into the one after it
  const error = !item
    ? undefined
    : !chosen
      ? 'Choose a date'
      : chosen < today
        ? 'Choose today or a later date'
        : next && chosen >= next.date
          ? `Choose a date before ${formatShortDate(next.date)}`
          : undefined;

  const start = (index: number) => {
    if (locked || !paydayId || !preview[index]) return;
    setEditing(index);
    setQuick('before');
    setDraft(toIsoDate(addDays(preview[index].date, QUICK_DAYS.before)));
  };

  const close = () => setEditing(null);

  const move = async (index: number, date: Date | null) => {
    const target = preview[index];
    if (!paydayId || !target) return;
    try {
      await setOverride({
        variables: { id: paydayId, for: toIsoDate(target.usual), date: date && toIsoDate(date) }
      });
      setEditing(null);
      showToast({
        message: date
          ? `Payday moved to ${formatShortDate(date)}`
          : `Payday back to ${formatShortDate(target.usual)}`
      });
    } catch (failure) {
      showToast({
        message: getApiErrorMessage(failure, "Couldn't change that payday. Try again.")
      });
    }
  };

  return {
    // The form's own changes come first
    locked,
    editing,
    quick,
    draft,
    error,
    saving,
    start,
    close,
    pickQuick: (pick: QuickPick) => {
      setQuick(pick);
      if (item && pick !== 'pick') setDraft(toIsoDate(addDays(item.date, QUICK_DAYS[pick])));
    },
    setDraft,
    save: () => {
      if (editing === null || !chosen || error) return;
      // The date it already is: nothing to change
      if (item && toIsoDate(item.date) === toIsoDate(chosen)) return close();
      void move(editing, chosen);
    },
    reset: (index: number) => void move(index, null)
  };
};

export type PaydayDates = ReturnType<typeof usePaydayDates>;
