import { useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { applyPrefs } from '~/lib/theme';
import { usePrefsStore } from '~/state/prefs';

/* Keeps the document's theme and accent in step with the saved preferences */
export const usePrefsSync = () => {
  const { theme, accent } = usePrefsStore(
    useShallow(state => ({ theme: state.theme, accent: state.accent }))
  );

  useEffect(() => {
    applyPrefs({ theme, accent });
  }, [theme, accent]);
};
