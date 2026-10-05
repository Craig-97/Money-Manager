import { Outlet } from 'react-router';
import { usePrefsSync } from '~/hooks/usePrefsSync';
import { useRestoreSession } from '~/hooks/useRestoreSession';
import { useServerPrefs } from '~/hooks/useServerPrefs';

/* Wraps every route: signs back in from the refresh cookie, and keeps the theme and accent in step
 * with the saved preferences */
export const RootLayout = () => {
  useRestoreSession();
  usePrefsSync();
  useServerPrefs();

  return <Outlet />;
};
