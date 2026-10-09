import { Plus } from 'lucide-react';
import { NavLink, useMatch } from 'react-router';
import { useShallow } from 'zustand/react/shallow';
import { preloadPage } from '~/app/routes/pageModules';
import { DashboardIcon, IconProps } from '~/components/icons';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';
import { useNoteComposerStore } from '~/state/noteComposer';
import { usePaymentDialogStore } from '~/state/paymentDialog';
import { MAIN_NAV, NavItem } from '../navItems';

// The add button sits in the middle, so the bar splits the pages either side of it
const [dashboard, recurring, forecast, notes] = MAIN_NAV;

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

/*
 * The floating mobile nav, with the add payment button in the middle. Profile isn't here: the
 * avatar in every page header opens it.
 */
export const BottomNav = ({ className }: { className?: string }) => {
  const { openChooser, openAdd } = usePaymentDialogStore(
    useShallow(s => ({ openChooser: s.openChooser, openAdd: s.openAdd }))
  );
  const openNote = useNoteComposerStore(s => s.openComposer);
  // The add button adds what the page is about: a note on notes, a recurring payment on recurring,
  // otherwise it asks which kind of payment
  const onRecurring = useMatch(ROUTES.recurring) !== null;
  const onNotes = useMatch(ROUTES.notes) !== null;
  const add = onNotes
    ? { label: 'Add note', open: openNote, dialog: false }
    : onRecurring
      ? { label: 'Add recurring payment', open: () => openAdd('recurring'), dialog: true }
      : { label: 'Add payment', open: openChooser, dialog: true };

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
        <BottomNavLink item={recurring} />
        <button
          type="button"
          aria-label={add.label}
          aria-haspopup={add.dialog ? 'dialog' : undefined}
          onClick={add.open}
          className="flex h-[52px] w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-accent text-on-accent">
          <Plus size={22} strokeWidth={2.5} aria-hidden="true" />
        </button>
        <BottomNavLink item={forecast} />
        <BottomNavLink item={notes} />
      </nav>
    </div>
  );
};
