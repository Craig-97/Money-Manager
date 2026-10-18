import { Link } from 'react-router';
import { Button } from '~/components/ui/Button';
import { buttonVariants } from '~/components/ui/Button/buttonVariants';
import { Modal } from '~/components/ui/Modal';
import { ROUTES } from '~/constants';
import { Bell } from '../ReminderBell/useBell';
import { ReminderRow } from '../ReminderRow';

/* The bell on mobile: a bottom sheet of what's new, each swiped to clear or put away */
export const BellSheet = ({ bell }: { bell: Bell }) => (
  <Modal
    open={bell.open}
    onOpenChange={bell.setOpen}
    title="Reminders"
    footer={
      <Link
        to={`${ROUTES.reminders}?tab=up`}
        onClick={bell.close}
        className={buttonVariants({ size: 'xl', className: 'w-full' })}>
        See what’s coming up
      </Link>
    }>
    {bell.fresh.length ? (
      <>
        <div className="-mt-2 -mb-2 flex items-center justify-between">
          <p className="text-xs font-bold tracking-[0.06em] text-muted uppercase">
            {bell.fresh.length} {bell.fresh.length === 1 ? 'reminder' : 'reminders'}
          </p>
          <span className="flex">
            {bell.unread ? (
              <Button
                variant="ghost"
                onClick={bell.markAllRead}
                className="h-10 px-3 text-[13px] text-accent-text">
                Mark all read
              </Button>
            ) : null}
            <Button
              variant="ghost"
              onClick={bell.clearAll}
              className="-mr-3 h-10 px-3 text-[13px] text-accent-text">
              Clear all
            </Button>
          </span>
        </div>
        <ul className="flex flex-col gap-1">
          {bell.fresh.map(reminder => (
            <ReminderRow
              key={reminder.key}
              reminder={reminder}
              today={bell.today}
              open={bell.openOf(reminder)}
              onLater={() => bell.later(reminder)}
              onClear={() => bell.clear(reminder)}
            />
          ))}
        </ul>
        <p className="text-[13px] font-medium text-muted">
          Swipe a reminder left to clear it, or put it away until later. Tap one to see more.
        </p>
      </>
    ) : (
      <p className="py-4 text-sm font-medium text-muted">
        Nothing new. Reminders show here when they go off.
      </p>
    )}
  </Modal>
);
