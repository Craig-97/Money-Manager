import { Outlet } from 'react-router';
import { usePrefsSync } from '~/hooks/usePrefsSync';

/* Wraps every route: keeps the document's theme and accent in step with the saved preferences */
export const RootLayout = () => {
  usePrefsSync();

  return <Outlet />;
};
