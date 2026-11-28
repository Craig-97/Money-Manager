import { useShallow } from 'zustand/react/shallow';
import { Theme, usePrefsStore } from '~/state/prefs';
import { useMediaQuery } from '../useMediaQuery';

/*
 * The theme in use, worked out from the saved choice: System follows the device. Toggling picks
 * the opposite of what's showing.
 */
export const useTheme = () => {
  const { preference, setTheme } = usePrefsStore(
    useShallow(s => ({ preference: s.theme, setTheme: s.setTheme }))
  );
  const deviceLight = useMediaQuery('(prefers-color-scheme: light)');
  const theme: Theme = preference === 'system' ? (deviceLight ? 'light' : 'dark') : preference;

  return {
    preference,
    theme,
    setTheme,
    toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark')
  };
};
