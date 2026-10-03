import { useSyncExternalStore } from 'react';

/* Whether a CSS media query matches, updating when it changes */
export const useMediaQuery = (query: string) => {
  const subscribe = (onChange: () => void) => {
    const mediaQueryList = window.matchMedia(query);
    mediaQueryList.addEventListener('change', onChange);
    return () => mediaQueryList.removeEventListener('change', onChange);
  };

  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches);
};
