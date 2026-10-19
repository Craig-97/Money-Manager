import { ComponentType } from 'react';
import { PageName } from '~/app/routes/pageModules';
import {
  AccountsIcon,
  DashboardIcon,
  DebtsIcon,
  ForecastIcon,
  IconProps,
  NotesIcon,
  RecurringIcon,
  RemindersIcon
} from '~/components/icons';
import { ROUTES } from '~/constants';

export interface NavItem {
  to: string;
  label: string;
  page: PageName;
  Icon: ComponentType<IconProps>;
  // The everyday pages come first; the rest sit below a divider in the sidebar, and under More in
  // the mobile nav
  section: 'main' | 'more';
}

export const MAIN_NAV: NavItem[] = [
  {
    to: ROUTES.dashboard,
    label: 'Dashboard',
    page: 'dashboard',
    Icon: DashboardIcon,
    section: 'main'
  },
  {
    to: ROUTES.recurring,
    label: 'Recurring',
    page: 'recurring',
    Icon: RecurringIcon,
    section: 'main'
  },
  { to: ROUTES.forecast, label: 'Forecast', page: 'forecast', Icon: ForecastIcon, section: 'main' },
  {
    to: ROUTES.accounts,
    label: 'Accounts',
    page: 'accounts',
    Icon: AccountsIcon,
    section: 'more'
  },
  { to: ROUTES.debts, label: 'Debts', page: 'debts', Icon: DebtsIcon, section: 'more' },
  { to: ROUTES.notes, label: 'Notes', page: 'notes', Icon: NotesIcon, section: 'more' },
  {
    to: ROUTES.reminders,
    label: 'Reminders',
    page: 'reminders',
    Icon: RemindersIcon,
    section: 'more'
  }
];

export const navItem = (page: PageName) => MAIN_NAV.find(item => item.page === page)!;

export const navSection = (section: NavItem['section']) =>
  MAIN_NAV.filter(item => item.section === section);
