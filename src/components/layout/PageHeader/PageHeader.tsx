import { ReactNode } from 'react';
import { Link } from 'react-router';
import { Avatar } from '~/components/ui/Avatar';
import { ROUTES } from '~/constants';
import { useCurrentUser } from '~/hooks/useCurrentUser';
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
}

/* Today's date and the page title. On mobile the profile avatar sits on the right. */
export const PageHeader = ({ title, description, titleNote, actions }: PageHeaderProps) => {
  const { user } = useCurrentUser();
  const today = new Date();
  const name = user ? `${user.firstName} ${user.surname}` : '';

  return (
    <header className="flex items-center justify-between gap-4 px-0.5 md:items-end md:px-0">
      <div>
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
      {actions ? <div className="hidden flex-wrap gap-2 md:flex">{actions}</div> : null}
      <Link
        to={ROUTES.profile}
        aria-label={`Profile, ${name}`}
        className="rounded-full transition-shadow hover:shadow-[0_0_0_3px_var(--border-strong)] md:hidden">
        <Avatar initials={getInitials(user?.firstName, user?.surname)} />
      </Link>
    </header>
  );
};
