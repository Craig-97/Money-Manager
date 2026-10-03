import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  // Wide screens: the person collapsed the sidebar to the icon rail (remembered)
  collapsed: boolean;
  // Narrower screens: the full sidebar is open over the content (never remembered)
  overlayOpen: boolean;
  setCollapsed: (collapsed: boolean) => void;
  setOverlayOpen: (overlayOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    set => ({
      collapsed: false,
      overlayOpen: false,
      setCollapsed: collapsed => set({ collapsed }),
      setOverlayOpen: overlayOpen => set({ overlayOpen })
    }),
    {
      name: 'mm-sidebar',
      version: 1,
      partialize: ({ collapsed }) => ({ collapsed })
    }
  )
);
