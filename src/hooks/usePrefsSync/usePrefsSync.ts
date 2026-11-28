import { useEffect } from 'react';
import { applyPrefs } from '~/lib/theme';
import { usePrefsStore } from '~/state/prefs';
import { useTheme } from '../useTheme';

/* Keeps the document's theme and accent in step with the saved preferences and the device */
export const usePrefsSync = () => {
  const { theme } = useTheme();
  const accent = usePrefsStore(s => s.accent);

  useEffect(() => {
    applyPrefs({ theme, accent });
  }, [theme, accent]);
};
