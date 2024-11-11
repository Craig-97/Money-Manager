import { persist } from 'zustand/middleware';
import { create } from 'zustand';

interface SidebarState {
  isOpen: boolean;
  setSidebarIsOpen: (isOpen: boolean) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    set => ({
      isOpen: true,
      setSidebarIsOpen: (isOpen: boolean) => set({ isOpen })
    }),
    {
      name: 'sidebar-storage'
    }
  )
);
