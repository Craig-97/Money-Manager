import { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';

/*
 * Pages scroll inside the app shell's <main> rather than the window, and <main> stays mounted from
 * page to page, so it would keep the last page's scroll position. Give the returned ref to the
 * element that scrolls: it goes back to the top each time the page changes, before the new page
 * paints.
 */
export const useScrollTopOnNavigate = <T extends HTMLElement>() => {
  const ref = useRef<T>(null);
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const element = ref.current;
    if (element) element.scrollTop = 0;
  }, [pathname]);
  return ref;
};
