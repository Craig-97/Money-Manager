import { useEffect } from 'react';
import { applyPrefs } from '~/lib/theme';
import { usePrefsStore } from '~/state/prefs';

/* Keeps the document's theme and accent in step with the saved preferences */
export const usePrefsSync = () => {
  const theme = usePrefsStore(state => state.theme);
  const accent = usePrefsStore(state => state.accent);

  useEffect(() => {
    applyPrefs({ theme, accent });
  }, [theme, accent]);
};
