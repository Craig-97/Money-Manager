import { ReminderCard, ReminderRow } from '~/components/reminders';
import { Tile } from '~/components/ui/Tile';
import { RemindersPage } from '../../hooks';
import { AllCaughtUp } from '../AllCaughtUp';

/*
 * New: the reminders that have gone off, overdue payments first. Full cards on desktop; rows on
 * mobile that swipe to clear or put away, and open to show more.
 */
export const NewList = ({ page, mobile }: { page: RemindersPage; mobile: boolean }) => {
  const { fresh, actions, today } = page;
  if (!fresh.length) return <AllCaughtUp />;

  if (mobile) {
    return (
      <>
        <ul
          aria-label="New reminders"
          className="flex flex-col gap-1 rounded-3xl border border-border bg-surface p-2">
          {fresh.map(reminder => (
            <ReminderRow
              key={reminder.key}
              reminder={reminder}
              today={today}
              open={page.openOf(reminder)}
              onLater={() => void actions.later(reminder)}
              onClear={() => void actions.clear(reminder)}
            />
          ))}
        </ul>
        <p className="-mt-1 px-1 text-[13px] font-medium text-muted">
          Swipe a reminder left to clear it, or put it away until later. Tap one to see more.
        </p>
      </>
    );
  }

  return (
    <Tile flat aria-label="New reminders" className="gap-1.5 p-2.5 md:gap-1.5 md:p-2.5">
      <ul className="flex flex-col gap-1.5">
        {fresh.map(reminder => (
          <li key={reminder.key}>
            <ReminderCard
              reminder={reminder}
              today={today}
              open={page.openOf(reminder)}
              onLater={() => void actions.later(reminder)}
              onClear={() => void actions.clear(reminder)}
            />
          </li>
        ))}
      </ul>
    </Tile>
  );
};
