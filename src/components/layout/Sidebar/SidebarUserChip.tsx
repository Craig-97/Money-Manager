import { LogOut } from 'lucide-react';
import { NavLink } from 'react-router';
import { preloadPage } from '~/app/routes/pageModules';
import { Avatar } from '~/components/ui/Avatar';
import { Tooltip } from '~/components/ui/Tooltip';
import { ROUTES } from '~/constants';
import { useCurrentUser } from '~/hooks/useCurrentUser';
import { useLogout } from '~/hooks/useLogout';
import { cn } from '~/lib/cn';
import { getInitials } from '~/lib/format';

interface SidebarUserChipProps {
  expanded: boolean;
  onNavigate: () => void;
}

/* The signed-in user's link to their profile, plus log out */
export const SidebarUserChip = ({ expanded, onNavigate }: SidebarUserChipProps) => {
  const { user } = useCurrentUser();
  const logout = useLogout();

  const name = user ? `${user.firstName} ${user.surname}` : '';
  const preload = () => preloadPage('profile');

  return (
    <div
      className={cn(
        'flex items-center',
        expanded ? 'gap-1 rounded-[20px] border border-border bg-surface-2 p-1.5' : 'flex-col gap-2'
      )}>
      <Tooltip label={name} disabled={expanded}>
        <NavLink
          to={ROUTES.profile}
          aria-label={`${name}, open profile`}
          onClick={onNavigate}
          onMouseEnter={preload}
          onFocus={preload}
          className={cn(
            'flex min-h-[52px] items-center rounded-[18px] text-text no-underline transition-colors hover:bg-hover aria-[current=page]:bg-hover',
            expanded ? 'min-w-0 flex-1 gap-2.5 px-2 py-1' : 'w-[52px] justify-center'
          )}>
          <Avatar initials={getInitials(user?.firstName, user?.surname)} size="sm" />
          {expanded ? (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-bold">{name}</span>
              <span className="text-xs font-medium text-muted">View profile</span>
            </span>
          ) : null}
        </NavLink>
      </Tooltip>
      <Tooltip label="Log out" disabled={expanded}>
        <button
          type="button"
          aria-label="Log out"
          onClick={logout}
          className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-expense-bg hover:text-expense">
          <LogOut size={18} aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
};
