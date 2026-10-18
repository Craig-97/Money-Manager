import { SlidersHorizontal } from 'lucide-react';
import { Link } from 'react-router';
import { Button } from '~/components/ui/Button';
import { ROUTES } from '~/constants';
import { Bell } from '../ReminderBell/useBell';
import { ReminderCard } from '../ReminderCard';

/* The bell's list on desktop: what's new, with ways to read or clear it all and see the rest */
export const BellPanel = ({ bell }: { bell: Bell }) => (
  <div className="flex max-h-[min(640px,calc(100dvh-120px))] flex-col">
    <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-2">
      <h2 className="text-xl font-extrabold tracking-[-0.03em]">Reminders</h2>
      {bell.unread ? (
        <Button
          variant="ghost"
          onClick={bell.markAllRead}
          className="-mr-2 h-9 px-3 text-[13px] text-accent-text">
          Mark all read
        </Button>
      ) : null}
    </div>
    {bell.fresh.length ? (
      <ul className="flex min-h-0 flex-col gap-1.5 overflow-y-auto px-2.5 pb-2.5">
        {bell.fresh.map(reminder => (
          <li key={reminder.key}>
            <ReminderCard
              compact
              reminder={reminder}
              today={bell.today}
              open={bell.openOf(reminder)}
              onLater={() => bell.later(reminder)}
              onClear={() => bell.clear(reminder)}
            />
          </li>
        ))}
      </ul>
    ) : (
      <p className="px-5 pt-2 pb-6 text-sm font-medium text-muted">
        Nothing new. Reminders show here when they go off.
      </p>
    )}
    <div className="flex items-center gap-1 border-t border-border px-3 py-2.5">
      <Link
        to={ROUTES.reminders}
        onClick={bell.close}
        className="mr-auto rounded-full px-2.5 py-2 text-sm font-bold text-accent-text no-underline hover:bg-hover">
        See all reminders
      </Link>
      {bell.fresh.length ? (
        <Button
          variant="ghost"
          onClick={bell.clearAll}
          className="h-10 px-3 text-[13px] text-accent-text">
          Clear all
        </Button>
      ) : null}
      <Link
        to={`${ROUTES.reminders}#timing`}
        onClick={bell.close}
        aria-label="When reminders go off"
        className="inline-flex size-10 items-center justify-center rounded-full text-muted hover:bg-hover hover:text-text">
        <SlidersHorizontal size={17} aria-hidden="true" />
      </Link>
    </div>
  </div>
);
