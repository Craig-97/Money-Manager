import { NavLink } from 'react-router';
import { preloadPage } from '~/app/routes/pageModules';
import { Tooltip } from '~/components/ui/Tooltip';
import { cn } from '~/lib/cn';
import { NavItem } from '../navItems';

interface SidebarNavLinkProps {
  item: NavItem;
  expanded: boolean;
  onNavigate: () => void;
}

export const SidebarNavLink = ({ item, expanded, onNavigate }: SidebarNavLinkProps) => {
  const { to, label, page, Icon } = item;
  const preload = () => preloadPage(page);

  return (
    <Tooltip label={label} disabled={expanded}>
      <NavLink
        to={to}
        aria-label={expanded ? undefined : label}
        onClick={onNavigate}
        onMouseEnter={preload}
        onFocus={preload}
        // NavLink marks the active link with aria-current="page". A plain string class is needed
        // here because the tooltip trigger merges class names as strings.
        className={cn(
          'flex h-[52px] items-center gap-3.5 rounded-[18px] text-[17px] font-semibold whitespace-nowrap text-muted no-underline transition-colors hover:bg-hover hover:text-text',
          'aria-[current=page]:bg-accent-soft aria-[current=page]:font-bold aria-[current=page]:text-text aria-[current=page]:[&_svg]:text-accent-text',
          expanded ? 'px-4' : 'justify-center px-0'
        )}>
        <Icon />
        {expanded ? <span>{label}</span> : null}
      </NavLink>
    </Tooltip>
  );
};
