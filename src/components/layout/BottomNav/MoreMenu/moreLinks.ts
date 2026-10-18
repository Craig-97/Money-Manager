import { ComponentType } from 'react';
import { PageName } from '~/app/routes/pageModules';
import { IconProps, ProfileIcon } from '~/components/icons';
import { ROUTES } from '~/constants';
import { navSection } from '../../navItems';

export interface MoreLink {
  to: string;
  label: string;
  page: PageName;
  Icon: ComponentType<IconProps>;
}

// The pages that don't fit in the bar, then the profile, which the page header's avatar opens too
export const MORE_LINKS: MoreLink[] = [
  ...navSection('more').map(({ to, label, page, Icon }) => ({ to, label, page, Icon })),
  { to: ROUTES.profile, label: 'Profile', page: 'profile', Icon: ProfileIcon }
];
