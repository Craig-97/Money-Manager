import { Plus } from 'lucide-react';
import { NavLink } from 'react-router';
import { preloadPage } from '~/app/routes/pageModules';
import { DashboardIcon, IconProps } from '~/components/icons';
import { cn } from '~/lib/cn';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { MAIN_NAV, NavItem, PROFILE_NAV } from '../navItems';

const [dashboard, forecast, notes] = MAIN_NAV;

// The mobile nav draws the dashboard tiles with rounder corners
const RoundedDashboardIcon = (props: IconProps) => <DashboardIcon cornerRadius={2} {...props} />;

const BottomNavLink = ({ item }: { item: NavItem }) => {
  const { to, label, page } = item;
  const Icon = page === 'dashboard' ? RoundedDashboardIcon : item.Icon;
  const preload = () => preloadPage(page);

  return (
    <NavLink
      to={to}
      aria-label={label}
      onFocus={preload}
      onTouchStart={preload}
      className="flex h-[52px] w-14 items-center justify-center rounded-full text-nav-icon no-underline hover:text-nav-active-bg aria-[current=page]:bg-nav-active-bg aria-[current=page]:text-nav-active-text">
      <Icon size={22} strokeWidth={1.9} />
    </NavLink>
  );
};

/* The floating mobile nav, with the add payment button in the middle */
export const BottomNav = ({ className }: { className?: string }) => {
  const openChooser = usePaymentDialogStore(s => s.openChooser);

  return (
    <div
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center bg-linear-to-t from-bg from-60% to-transparent px-4 pt-6 pb-[calc(22px+env(safe-area-inset-bottom))]',
        className
      )}>
      <nav
        aria-label="Main"
        className="pointer-events-auto flex items-center gap-1 rounded-full border border-border bg-nav-bg p-1.5 shadow-[0_18px_36px_-14px_var(--shadow)]">
        <BottomNavLink item={dashboard} />
        <BottomNavLink item={forecast} />
        <button
          type="button"
          aria-label="Add payment"
          aria-haspopup="dialog"
          onClick={openChooser}
          className="flex h-[52px] w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-accent text-on-accent">
          <Plus size={22} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <BottomNavLink item={notes} />
        <BottomNavLink item={PROFILE_NAV} />
      </nav>
    </div>
  );
};
