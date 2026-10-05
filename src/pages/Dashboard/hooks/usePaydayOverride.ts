import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { SetPaydayOverrideDocument } from '~/graphql/generated';
import { Account } from '~/hooks/useAccount';
import { addDays, toIsoDate } from '~/lib/dates';
import { getApiErrorMessage } from '~/lib/errors';
import { BankHolidays, getNextPaydays, PayCycle } from '~/lib/payday';
import { formatShortDate, Payment } from '~/lib/payments';
import { showToast } from '~/state/toast';
import { overridePreview } from '../dashboardModel';

// How far a payday can be moved later when there's no payday after it to stop at
const FALLBACK_DAYS = 28;

interface Options {
  account: Account;
  cycle: PayCycle;
  today: Date;
  holidays: BankHolidays;
  payments: Payment[];
}

/* Moving just the next payday, e.g. paid early before Christmas, and putting it back */
export const usePaydayOverride = ({ account, cycle, today, holidays, payments }: Options) => {
  const [setOverride, { loading: saving }] = useMutation(SetPaydayOverrideDocument);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState(cycle.end);

  const { payday } = account;
  const moved = cycle.end.getTime() !== cycle.endUsual.getTime();
  // It can't run into the payday after this one
  const following = payday
    ? getNextPaydays(payday, holidays, addDays(cycle.endUsual, 1), 1)[0]
    : undefined;
  const latest = following ? addDays(following, -1) : addDays(cycle.endUsual, FALLBACK_DAYS);
  const changed = picked.getTime() !== cycle.end.getTime();

  const move = async (date: Date | null) => {
    if (!payday) return false;
    try {
      await setOverride({
        variables: {
          id: payday.id,
          for: toIsoDate(cycle.endUsual),
          date: date ? toIsoDate(date) : null
        }
      });
      return true;
    } catch (error) {
      showToast({ message: getApiErrorMessage(error, "Couldn't change your payday. Try again.") });
      return false;
    }
  };

  // Moves it, or puts it back with null, and offers to undo
  const change = async (date: Date | null) => {
    const undoTo = moved ? cycle.end : null;
    if (!(await move(date))) return;
    setOpen(false);
    showToast({
      message: date
        ? `Payday moved to ${formatShortDate(date)}`
        : `Payday back to ${formatShortDate(cycle.endUsual)}`,
      action: { label: 'Undo', onClick: () => void move(undoTo) }
    });
  };

  // Nothing changed just closes. Choosing the usual date is the same as putting it back.
  const save = async () => {
    if (!changed) return setOpen(false);
    await change(picked.getTime() === cycle.endUsual.getTime() ? null : picked);
  };

  return {
    // Without a saved payday there's no rule to move a date from
    canChange: !!payday,
    open,
    setOpen: (next: boolean) => {
      if (next) setPicked(cycle.end);
      setOpen(next);
    },
    moved,
    usual: cycle.endUsual,
    picked,
    pick: setPicked,
    earliest: today,
    latest,
    holidays,
    changed,
    preview: overridePreview({
      payments,
      bankBalance: account.bankBalance,
      monthlyIncome: account.monthlyIncome,
      cycle,
      today,
      picked
    }),
    saving,
    save: () => void save(),
    reset: () => void change(null)
  };
};

export type PaydayOverride = ReturnType<typeof usePaydayOverride>;
