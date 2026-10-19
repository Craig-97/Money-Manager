import { ReactNode } from 'react';
import { Link } from 'react-router';
import { ReminderBell } from '~/components/reminders';
import { Avatar } from '~/components/ui/Avatar';
import { MEDIA, ROUTES } from '~/constants';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useMediaQuery } from '~/hooks/useMediaQuery';
import { formatLongDate } from '~/lib/dates';
import { getInitials } from '~/lib/format';

interface PageHeaderProps {
  title: string;
  // A line under the title, shown on the desktop layout
  description?: ReactNode;
  // Beside the title on the mobile layout, e.g. how many notes there are
  titleNote?: ReactNode;
  // Page actions, shown on the desktop layout
  actions?: ReactNode;
  // Beside the avatar on mobile, in place of the reminders bell
  mobileActions?: ReactNode;
}

/*
 * Today's date and the page title, with the reminders bell on the right. On mobile the profile
 * avatar sits beside it.
 */
export const PageHeader = ({
  title,
  description,
  titleNote,
  actions,
  mobileActions
}: PageHeaderProps) => {
  const { user } = useCurrentUser();
  // One bell, where the layout shows it
  const isDesktop = useMediaQuery(MEDIA.desktop);
  const today = new Date();
  const name = user ? `${user.firstName} ${user.surname}` : '';

  // On desktop the title and bell share the top row. The actions sit between them when the header
  // is wide enough, and on their own row under the title when it isn't, so they never wrap above it.
  return (
    <header className="@container px-0.5 md:px-0">
      <div className="flex items-center justify-between gap-4 md:grid md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-y-4 @min-[50rem]:grid-cols-[minmax(0,1fr)_auto_auto]">
        <div className="md:col-start-1 md:row-start-1">
          <p className="text-[13px] font-semibold text-muted md:text-sm">
            <span className="md:hidden">{formatLongDate(today, { withYear: false })}</span>
            <span className="hidden md:inline">{formatLongDate(today)}</span>
          </p>
          <div className="mt-0.5 flex items-baseline gap-2 md:mt-1.5">
            <h1 className="text-[26px] font-extrabold tracking-[-0.035em] md:text-4xl md:leading-[1.1]">
              {title}
            </h1>
            {titleNote ? (
              <span className="num text-[15px] font-bold tracking-normal text-muted md:hidden">
                {titleNote}
              </span>
            ) : null}
          </div>
          {description ? (
            <p className="mt-1.5 hidden text-[15px] text-muted md:block">{description}</p>
          ) : null}
        </div>
        {actions ? (
          <div className="hidden flex-wrap items-center gap-2 md:col-span-2 md:row-start-2 md:flex @min-[50rem]:col-span-1 @min-[50rem]:col-start-2 @min-[50rem]:row-start-1 @min-[50rem]:justify-end">
            {actions}
          </div>
        ) : null}
        {isDesktop ? (
          <div className="hidden md:col-start-2 md:row-start-1 md:block @min-[50rem]:col-start-3">
            <ReminderBell />
          </div>
        ) : null}
        <div className="flex shrink-0 items-center gap-2 md:hidden">
          {isDesktop ? null : (mobileActions ?? <ReminderBell />)}
          <Link
            to={ROUTES.profile}
            aria-label={`Profile, ${name}`}
            className="rounded-full transition-shadow hover:shadow-[0_0_0_3px_var(--border-strong)]">
            <Avatar initials={getInitials(user?.firstName, user?.surname)} />
          </Link>
        </div>
      </div>
    </header>
  );
};
