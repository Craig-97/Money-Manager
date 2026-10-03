import { useShallow } from 'zustand/react/shallow';
import { MEDIA } from '~/constants';
import { useSidebarStore } from '~/state/sidebar';
import { useMediaQuery } from '../useMediaQuery';

/*
 * How the desktop sidebar shows. On wide screens it is expanded unless collapsed to the icon rail.
 * Below that it is the rail, and expanding it opens the full sidebar over the content.
 */
export const useSidebarMode = () => {
  const isWide = useMediaQuery(MEDIA.wide);
  const { collapsed, overlayOpen, setCollapsed, setOverlayOpen } = useSidebarStore(
    useShallow(state => ({
      collapsed: state.collapsed,
      overlayOpen: state.overlayOpen,
      setCollapsed: state.setCollapsed,
      setOverlayOpen: state.setOverlayOpen
    }))
  );

  const isOverlay = !isWide && overlayOpen;
  const expanded = isWide ? !collapsed : overlayOpen;

  const toggle = () => {
    if (isWide) {
      setCollapsed(!collapsed);
    } else {
      setOverlayOpen(!overlayOpen);
    }
  };

  const closeOverlay = () => setOverlayOpen(false);

  return { expanded, isOverlay, toggle, closeOverlay };
};
