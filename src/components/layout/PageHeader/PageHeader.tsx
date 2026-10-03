import { ReactNode } from 'react';
import { Link } from 'react-router';
import { Avatar } from '~/components/ui/Avatar';
import { ROUTES } from '~/constants';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { formatLongDate } from '~/lib/dates';
import { getInitials } from '~/lib/format';

interface PageHeaderProps {
  title: string;
  // Page actions, shown on the desktop layout
  actions?: ReactNode;
}

/* Today's date and the page title. On mobile the profile avatar sits on the right. */
export const PageHeader = ({ title, actions }: PageHeaderProps) => {
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
        <h1 className="mt-0.5 text-[26px] font-extrabold tracking-[-0.035em] md:mt-1.5 md:text-4xl md:leading-[1.1]">
          {title}
        </h1>
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
