import { NavLink } from 'react-router';
import { preloadPage } from '~/app/routes/pageModules';
import { DashboardIcon } from '~/components/icons';
import { NavItem } from '../../navItems';

/* One of the mobile nav's pages, as a round icon button */
export const BottomNavLink = ({ item }: { item: NavItem }) => {
  const { to, label, page } = item;
  const Icon = item.Icon;
  const preload = () => preloadPage(page);

  return (
    <NavLink
      to={to}
      aria-label={label}
      onFocus={preload}
      onTouchStart={preload}
      className="flex h-[52px] w-14 items-center justify-center rounded-full text-nav-icon no-underline hover:text-nav-active-bg aria-[current=page]:bg-nav-active-bg aria-[current=page]:text-nav-active-text">
      {/* The mobile nav draws the dashboard tiles with rounder corners */}
      {page === 'dashboard' ? (
        <DashboardIcon cornerRadius={2} size={22} strokeWidth={1.9} />
      ) : (
        <Icon size={22} strokeWidth={1.9} />
      )}
    </NavLink>
  );
};
