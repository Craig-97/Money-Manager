import { ComponentType } from 'react';
import { PageName } from '~/app/routes/pageModules';
import {
  DashboardIcon,
  ForecastIcon,
  IconProps,
  NotesIcon,
  RecurringIcon
} from '~/components/icons';
import { ROUTES } from '~/constants';

export interface NavItem {
  to: string;
  label: string;
  page: PageName;
  Icon: ComponentType<IconProps>;
}

export const MAIN_NAV: NavItem[] = [
  { to: ROUTES.dashboard, label: 'Dashboard', page: 'dashboard', Icon: DashboardIcon },
  { to: ROUTES.recurring, label: 'Recurring', page: 'recurring', Icon: RecurringIcon },
  { to: ROUTES.forecast, label: 'Forecast', page: 'forecast', Icon: ForecastIcon },
  { to: ROUTES.notes, label: 'Notes', page: 'notes', Icon: NotesIcon }
];
