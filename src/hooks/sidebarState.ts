import { useEffect, useRef } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useSidebarStore } from '~/state';

/**
 * Manages the sidebar's open state. If the screen size is below 'md', the sidebar is closed.
 * If the screen size is above 'md' and was previously closed, it is opened.
 * On first load, the sidebar's open state is restored from local storage or set to open if no value is stored.
 */
export const useSidebarState = () => {
  const theme = useTheme();
  const isBelowLg = useMediaQuery(theme.breakpoints.down('lg'));
  const { setSidebarIsOpen } = useSidebarStore();
  const wasBelow = useRef(isBelowLg);

  useEffect(() => {
    if (isBelowLg) {
      setSidebarIsOpen(false);
    } else {
      if (wasBelow.current) {
        setSidebarIsOpen(true);
      } else {
        const storedValue = localStorage.getItem('sidebar-storage');
        const parsedIsOpen = storedValue ? JSON.parse(storedValue)?.state?.isOpen : true;
        setSidebarIsOpen(parsedIsOpen);
      }
    }
    wasBelow.current = isBelowLg;
  }, [isBelowLg, setSidebarIsOpen]);
};
