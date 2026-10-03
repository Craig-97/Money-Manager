import { ChevronLeft } from 'lucide-react';
import { NavLink } from 'react-router';
import { BrandMark } from '~/components/ui/BrandMark';
import { Tooltip } from '~/components/ui/Tooltip';
import { ROUTES } from '~/constants';
import { useEscapeKey } from '~/hooks/useEscapeKey';
import { useSidebarMode } from '~/hooks/useSidebarMode';
import { cn } from '~/lib/cn';
import { MAIN_NAV } from '../navItems';
import { SidebarNavLink } from './SidebarNavLink';
import { SidebarThemeSwitch } from './SidebarThemeSwitch';
import { SidebarUserChip } from './SidebarUserChip';

/*
 * The desktop sidebar. Expanded it is 300px wide; as the icon rail it is 88px. On narrower
 * desktop screens, expanding it opens the full sidebar over the content with a scrim behind.
 */
export const Sidebar = ({ className }: { className?: string }) => {
  const { expanded, isOverlay, toggle, closeOverlay } = useSidebarMode();
  const toggleLabel = expanded ? 'Collapse sidebar' : 'Expand sidebar';

  // Escape closes the overlay wherever focus is
  useEscapeKey(closeOverlay, isOverlay);

  return (
    <>
      <aside
        aria-label="Sidebar"
        className={cn(
          'relative z-50 shrink-0 py-4 pl-4 transition-[width] duration-200 ease-out',
          expanded && !isOverlay ? 'w-[300px]' : 'w-[88px]',
          className
        )}>
        <div
          className={cn(
            'flex flex-col overflow-y-auto rounded-[28px] border border-border bg-surface py-[22px]',
            expanded ? 'gap-7 px-4' : 'gap-5 px-2',
            isOverlay
              ? 'absolute top-4 bottom-4 left-4 z-60 w-[284px] shadow-[0_18px_40px_-12px_rgb(0_0_0/0.55)]'
              : 'h-full'
          )}>
          <div
            className={cn(
              'flex items-center',
              expanded ? 'justify-between gap-2' : 'flex-col gap-3'
            )}>
            <Tooltip label="Money Manager" disabled={expanded}>
              <NavLink
                to={ROUTES.dashboard}
                aria-label="Money Manager home"
                onClick={closeOverlay}
                className={cn(
                  'flex min-w-0 items-center gap-2.5 whitespace-nowrap text-text no-underline',
                  expanded ? 'px-2' : 'justify-center'
                )}>
                <BrandMark />
                {expanded ? (
                  <span className="text-base font-bold tracking-[-0.01em]">Money Manager</span>
                ) : null}
              </NavLink>
            </Tooltip>
            <Tooltip label={toggleLabel} disabled={expanded}>
              <button
                type="button"
                aria-label={toggleLabel}
                aria-expanded={expanded}
                onClick={toggle}
                className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-hover hover:text-text">
                <ChevronLeft
                  size={20}
                  aria-hidden="true"
                  className={cn('transition-transform duration-200', !expanded && 'rotate-180')}
                />
              </button>
            </Tooltip>
          </div>

          <nav aria-label="Main" className="flex flex-col gap-1">
            {MAIN_NAV.map(item => (
              <SidebarNavLink
                key={item.to}
                item={item}
                expanded={expanded}
                onNavigate={closeOverlay}
              />
            ))}
          </nav>

          <div className="mt-auto flex flex-col gap-3.5">
            <SidebarThemeSwitch expanded={expanded} />
            <SidebarUserChip expanded={expanded} onNavigate={closeOverlay} />
          </div>
        </div>
      </aside>

      {isOverlay ? (
        <div aria-hidden="true" className="fixed inset-0 z-45 bg-scrim" onClick={closeOverlay} />
      ) : null}
    </>
  );
};
