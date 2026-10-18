import { Bell, CalendarDays, Mail } from 'lucide-react';
import { Link } from 'react-router';
import { ReminderWay, WayTag } from '~/components/reminders';
import { ROUTES } from '~/constants';
import { useAccount } from '~/hooks/useAccount';

/* The ways reminders reach you: in the app, your phone's calendar, and (later) email */
export const HowYoullHear = () => {
  const { account } = useAccount();
  const calendarOn = !!account?.calendarFeed.token;

  return (
    <div className="flex flex-col gap-2">
      <ReminderWay
        icon={<Bell size={17} aria-hidden="true" />}
        title="In the app"
        text="The bell, and the New tab here"
        end={<WayTag tone="on">Always on</WayTag>}
      />
      <ReminderWay
        icon={<CalendarDays size={17} aria-hidden="true" />}
        title="Your phone’s calendar"
        text="Alerts even when the app is closed"
        end={
          <Link
            to={`${ROUTES.profile}#reminders`}
            className="inline-flex h-10 shrink-0 items-center rounded-full border border-border bg-surface px-3.5 text-[13px] font-bold text-text no-underline hover:border-border-strong hover:bg-hover">
            {calendarOn ? 'On' : 'Set up'}
            <span className="sr-only"> your phone’s calendar</span>
          </Link>
        }
      />
      <ReminderWay
        muted
        icon={<Mail size={17} aria-hidden="true" />}
        title="Email"
        text="Needs a daily job on the server"
        end={<WayTag tone="later">Later</WayTag>}
      />
    </div>
  );
};
