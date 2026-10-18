import { Fragment, ReactNode } from 'react';
import { CircleUserRound, Ellipsis } from 'lucide-react';
import { matchPath, useLocation, useNavigate } from 'react-router';
import { PageName, preloadPage } from '~/app/routes/pageModules';
import { Menu, MenuContent, MenuItem, MenuSeparator, MenuTrigger } from '~/components/ui/Menu';
import { ROUTES } from '~/constants';
import { cn } from '~/lib/cn';
import { navSection } from '../../navItems';

interface MoreLink {
  to: string;
  label: string;
  page: PageName;
  icon: ReactNode;
}

// The pages that don't fit in the bar, then the profile, which the page header's avatar opens too
const MORE_LINKS: MoreLink[] = [
  ...navSection('more').map(({ to, label, page, Icon }) => ({
    to,
    label,
    page,
    icon: <Icon size={18} />
  })),
  {
    to: ROUTES.profile,
    label: 'Profile',
    page: 'profile',
    icon: <CircleUserRound size={18} aria-hidden="true" />
  }
];

/* The mobile nav's last button. It's marked as the current page on any page it opens. */
export const MoreMenu = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  // A debt's own page counts as Debts
  const current = MORE_LINKS.find(link => matchPath({ path: link.to, end: false }, pathname));

  return (
    <Menu>
      <MenuTrigger>
        <button
          type="button"
          aria-label="More"
          // Says which of its pages is showing, as the other nav links do
          aria-description={current ? `On ${current.label}` : undefined}
          data-current={current ? '' : undefined}
          onFocus={() => MORE_LINKS.forEach(link => preloadPage(link.page))}
          className={cn(
            'flex h-[52px] w-14 cursor-pointer items-center justify-center rounded-full border-0 bg-transparent text-nav-icon hover:text-nav-active-bg',
            'data-current:bg-nav-active-bg data-current:text-nav-active-text'
          )}>
          <Ellipsis size={22} strokeWidth={1.9} aria-hidden="true" />
        </button>
      </MenuTrigger>
      <MenuContent side="top" sideOffset={14}>
        {MORE_LINKS.map(link => (
          <Fragment key={link.to}>
            {link.page === 'profile' ? <MenuSeparator /> : null}
            <MenuItem
              icon={link.icon}
              aria-current={link === current ? 'page' : undefined}
              onSelect={() => void navigate(link.to)}
              className="aria-[current=page]:font-bold aria-[current=page]:[&_svg]:text-accent-text">
              {link.label}
            </MenuItem>
          </Fragment>
        ))}
      </MenuContent>
    </Menu>
  );
};
