import { CalendarDays, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { ROUTES } from '~/constants';

/* On mobile: a way to the calendar feed, so the phone alerts you with the app closed */
export const CalendarPromo = () => (
  <Link
    to={`${ROUTES.profile}#reminders`}
    className="flex items-center gap-3.5 rounded-3xl border border-border bg-surface p-4 text-text no-underline transition-colors hover:bg-hover">
    <span
      aria-hidden="true"
      className="inline-flex size-[42px] shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-accent-text">
      <CalendarDays size={19} />
    </span>
    <span className="flex min-w-0 flex-1 flex-col">
      <span className="text-[15px] font-bold">Get these in your calendar</span>
      <span className="text-xs font-semibold text-muted">
        Your phone alerts you, even with the app closed
      </span>
    </span>
    <ChevronRight size={18} aria-hidden="true" className="shrink-0 text-muted" />
  </Link>
);
