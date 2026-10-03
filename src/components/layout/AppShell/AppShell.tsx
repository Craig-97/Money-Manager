import { CSSProperties } from 'react';
import { Outlet } from 'react-router';
import { Toaster } from '~/components/ui/Toaster';
import { useSidebarMode } from '~/hooks/useSidebarMode';
import { BottomNav } from '../BottomNav';
import { Sidebar } from '../Sidebar';

/* The signed-in layout: sidebar on desktop, floating bottom nav on mobile */
export const AppShell = () => {
  const { expanded, isOverlay } = useSidebarMode();
  // How much room the sidebar takes, so toasts centre under the content rather than the window
  const sidebarWidth = expanded && !isOverlay ? 300 : 88;

  return (
    <div
      className="flex h-dvh overflow-hidden"
      style={{ '--sidebar-w': `${sidebarWidth}px` } as CSSProperties}>
      <a
        href="#main"
        className="sr-only z-80 rounded-full bg-surface px-4 py-3 font-semibold focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        Skip to content
      </a>
      <Sidebar className="hidden md:block" />
      <main
        id="main"
        className="min-w-0 flex-1 overflow-y-auto px-4 pt-5 pb-[120px] md:px-10 md:pt-8 md:pb-14">
        <div className="mx-auto flex max-w-[1480px] flex-col gap-3.5 md:gap-7">
          <Outlet />
        </div>
      </main>
      <BottomNav className="md:hidden" />
      {/* Above the mobile nav; on desktop, centred in the space beside the sidebar */}
      <Toaster className="bottom-[calc(104px+env(safe-area-inset-bottom))] md:bottom-[calc(24px+env(safe-area-inset-bottom))] md:left-[calc(var(--sidebar-w)+(100%-var(--sidebar-w))/2)]" />
    </div>
  );
};
